package com.meta.wearable.dat.externalsampleapps.cameraaccess.openclaw

import kotlinx.coroutines.flow.StateFlow

interface ToolBridge {
    val lastToolCallStatus: StateFlow<ToolCallStatus>
    val connectionState: StateFlow<OpenClawConnectionState>

    suspend fun checkConnection()
    fun resetSession()
    fun setToolCallStatus(status: ToolCallStatus)
    suspend fun delegateTask(task: String, toolName: String = "execute"): ToolResult
}
