package com.meta.wearable.dat.externalsampleapps.cameraaccess.ax022

import android.util.Log
import com.meta.wearable.dat.externalsampleapps.cameraaccess.openclaw.OpenClawConnectionState
import com.meta.wearable.dat.externalsampleapps.cameraaccess.openclaw.ToolBridge
import com.meta.wearable.dat.externalsampleapps.cameraaccess.openclaw.ToolCallStatus
import com.meta.wearable.dat.externalsampleapps.cameraaccess.openclaw.ToolResult
import com.meta.wearable.dat.externalsampleapps.cameraaccess.settings.SettingsManager
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Thin Android client for the server-side AX-022 gateway.
 *
 * The phone stores only the scoped AX-022 wearable session token. Tenant agent
 * credentials such as MAXX_API_KEY remain on the gateway host.
 */
class Ax022GatewayBridge : ToolBridge {
    companion object {
        private const val TAG = "Ax022GatewayBridge"
    }

    private val _lastToolCallStatus = MutableStateFlow<ToolCallStatus>(ToolCallStatus.Idle)
    override val lastToolCallStatus: StateFlow<ToolCallStatus> = _lastToolCallStatus.asStateFlow()

    private val _connectionState = MutableStateFlow<OpenClawConnectionState>(OpenClawConnectionState.NotConfigured)
    override val connectionState: StateFlow<OpenClawConnectionState> = _connectionState.asStateFlow()

    private val client = OkHttpClient.Builder()
        .readTimeout(120, TimeUnit.SECONDS)
        .connectTimeout(10, TimeUnit.SECONDS)
        .build()

    override fun setToolCallStatus(status: ToolCallStatus) {
        _lastToolCallStatus.value = status
    }

    override suspend fun checkConnection() = withContext(Dispatchers.IO) {
        if (!SettingsManager.isAx022Configured) {
            _connectionState.value = OpenClawConnectionState.NotConfigured
            return@withContext
        }

        _connectionState.value = OpenClawConnectionState.Checking
        try {
            val request = Request.Builder()
                .url("${SettingsManager.ax022GatewayUrl.trimEnd('/')}/v1/capabilities")
                .get()
                .addHeader("Authorization", "Bearer ${SettingsManager.ax022SessionToken}")
                .build()
            val response = client.newCall(request).execute()
            response.close()
            _connectionState.value = if (response.isSuccessful) {
                OpenClawConnectionState.Connected
            } else {
                OpenClawConnectionState.Unreachable("AX-022 HTTP ${response.code}")
            }
        } catch (e: Exception) {
            _connectionState.value = OpenClawConnectionState.Unreachable(e.message ?: "Unknown error")
            Log.d(TAG, "AX-022 gateway unreachable: ${e.message}")
        }
    }

    override fun resetSession() {
        // Server-side AX-022 session identity is represented by the scoped bearer token.
    }

    override suspend fun delegateTask(task: String, toolName: String): ToolResult = withContext(Dispatchers.IO) {
        if (!SettingsManager.isAx022Configured) {
            return@withContext ToolResult.Failure("AX-022 gateway is not configured")
        }

        _lastToolCallStatus.value = ToolCallStatus.Executing(toolName)
        try {
            val body = JSONObject().put("message", task)
            val request = Request.Builder()
                .url("${SettingsManager.ax022GatewayUrl.trimEnd('/')}/v1/intent")
                .post(body.toString().toRequestBody("application/json".toMediaType()))
                .addHeader("Authorization", "Bearer ${SettingsManager.ax022SessionToken}")
                .addHeader("Content-Type", "application/json")
                .build()

            val response = client.newCall(request).execute()
            val responseText = response.body?.string().orEmpty()
            val status = response.code
            response.close()

            if (status !in 200..299) {
                _lastToolCallStatus.value = ToolCallStatus.Failed(toolName, "HTTP $status")
                return@withContext ToolResult.Failure("AX-022 returned HTTP $status")
            }

            val payload = JSONObject(responseText)
            val result = payload.opt("result")
            val spoken = when (result) {
                is JSONObject -> result.optString("response").ifBlank {
                    result.optString("text").ifBlank { result.toString() }
                }
                null -> responseText
                else -> result.toString()
            }

            _lastToolCallStatus.value = ToolCallStatus.Completed(toolName)
            ToolResult.Success(spoken)
        } catch (e: Exception) {
            Log.e(TAG, "AX-022 agent error: ${e.message}")
            _lastToolCallStatus.value = ToolCallStatus.Failed(toolName, e.message ?: "Unknown")
            ToolResult.Failure("AX-022 agent error: ${e.message}")
        }
    }
}
