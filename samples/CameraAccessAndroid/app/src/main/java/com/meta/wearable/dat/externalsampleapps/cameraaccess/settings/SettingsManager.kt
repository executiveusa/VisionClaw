package com.meta.wearable.dat.externalsampleapps.cameraaccess.settings

import android.content.Context
import android.content.SharedPreferences
import com.meta.wearable.dat.externalsampleapps.cameraaccess.Secrets

object SettingsManager {
    private const val PREFS_NAME = "visionclaw_settings"

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    var geminiAPIKey: String
        get() = prefs.getString("geminiAPIKey", null) ?: Secrets.geminiAPIKey
        set(value) = prefs.edit().putString("geminiAPIKey", value).apply()

    var geminiSystemPrompt: String
        get() = prefs.getString("geminiSystemPrompt", null) ?: DEFAULT_SYSTEM_PROMPT
        set(value) = prefs.edit().putString("geminiSystemPrompt", value).apply()

    var ax022GatewayUrl: String
        get() = prefs.getString("ax022GatewayUrl", "") ?: ""
        set(value) = prefs.edit().putString("ax022GatewayUrl", value).apply()

    var ax022SessionToken: String
        get() = prefs.getString("ax022SessionToken", "") ?: ""
        set(value) = prefs.edit().putString("ax022SessionToken", value).apply()

    val isAx022Configured: Boolean
        get() = ax022GatewayUrl.isNotBlank() && ax022SessionToken.isNotBlank()

    var openClawHost: String
        get() = prefs.getString("openClawHost", null) ?: Secrets.openClawHost
        set(value) = prefs.edit().putString("openClawHost", value).apply()

    var openClawPort: Int
        get() {
            val stored = prefs.getInt("openClawPort", 0)
            return if (stored != 0) stored else Secrets.openClawPort
        }
        set(value) = prefs.edit().putInt("openClawPort", value).apply()

    var openClawHookToken: String
        get() = prefs.getString("openClawHookToken", null) ?: Secrets.openClawHookToken
        set(value) = prefs.edit().putString("openClawHookToken", value).apply()

    var openClawGatewayToken: String
        get() = prefs.getString("openClawGatewayToken", null) ?: Secrets.openClawGatewayToken
        set(value) = prefs.edit().putString("openClawGatewayToken", value).apply()

    var webrtcSignalingURL: String
        get() = prefs.getString("webrtcSignalingURL", null) ?: Secrets.webrtcSignalingURL
        set(value) = prefs.edit().putString("webrtcSignalingURL", value).apply()

    var videoStreamingEnabled: Boolean
        get() = prefs.getBoolean("videoStreamingEnabled", true)
        set(value) = prefs.edit().putBoolean("videoStreamingEnabled", value).apply()

    var proactiveNotificationsEnabled: Boolean
        get() = prefs.getBoolean("proactiveNotificationsEnabled", true)
        set(value) = prefs.edit().putBoolean("proactiveNotificationsEnabled", value).apply()

    fun resetAll() {
        prefs.edit().clear().apply()
    }

    const val DEFAULT_SYSTEM_PROMPT = """You are the real-time voice and vision interface for someone wearing smart glasses. You can see through the active camera stream and have a natural voice conversation. Keep responses concise and useful for a wearable.

CRITICAL: You do not directly own business credentials or unrestricted external authority. You have one tool named execute. Use it whenever the user asks for persistent memory, research, messaging, scheduling, business operations, connected-app actions, missions, or anything beyond answering from the current conversation and visual context.

The execute tool routes to the configured agent gateway. In AX-022 mode that gateway enforces tenant identity, permissions, approvals, and receipts before reaching the user's business agent. In legacy mode it may route to OpenClaw.

ALWAYS use execute when the user asks you to:
- Send a message or create external communication
- Search or look up current/external information through connected tools
- Add, create, or modify persistent data
- Create or dispatch a business mission
- Interact with apps, devices, services, or company systems
- Remember or store information for later

Never claim an external action succeeded until the tool returns success.

Before calling execute, speak a brief acknowledgment so the wearer knows the request was heard. Keep the acknowledgment short because the tool may take several seconds.

For consequential actions, explain that approval may still be required by the connected agent/control plane."""
}
