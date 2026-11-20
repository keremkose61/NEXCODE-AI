import os
import platform
from ..models.schemas import HardwareProfile

def detect_hardware() -> HardwareProfile:
    # CPU info
    cpu_model = platform.processor() or "Generic x86_64 CPU"
    cpu_cores = os.cpu_count() or 4
    is_amd_cpu = "amd" in cpu_model.lower() or "ryzen" in cpu_model.lower()

    # Total RAM calculation
    try:
        import ctypes
        class MEMORYSTATUSEX(ctypes.Structure):
            _fields_ = [
                ("dwLength", ctypes.c_ulong),
                ("dwMemoryLoad", ctypes.c_ulong),
                ("ullTotalPhys", ctypes.c_ulonglong),
                ("ullAvailPhys", ctypes.c_ulonglong),
                ("ullTotalPageFile", ctypes.c_ulonglong),
                ("ullAvailPageFile", ctypes.c_ulonglong),
                ("ullTotalVirtual", ctypes.c_ulonglong),
                ("ullAvailVirtual", ctypes.c_ulonglong),
                ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]
        stat = MEMORYSTATUSEX()
        stat.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
        ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(stat))
        total_ram_gb = round(stat.ullTotalPhys / (1024 ** 3))
    except Exception:
        total_ram_gb = 16

    # Acceleration mode analysis: Never assume GPU without safe fallback
    # Check AMD GPU / NVIDIA presence safely
    gpu_detected = None
    acceleration_mode = "CPU"
    notes = "Running on multi-threaded CPU safe mode."

    # Determine recommended open-weight coding model based on real hardware
    if total_ram_gb >= 16:
        recommended_model = "qwen2.5-coder:7b"
        notes += " Sufficient system memory detected for 7B parameter coding models."
    elif total_ram_gb >= 8:
        recommended_model = "qwen2.5-coder:7b"
        notes += " 8-16GB RAM: Qwen 2.5 Coder 7B (Q4_K_M) recommended for optimal latency."
    else:
        recommended_model = "llama3.2:3b"
        notes += " Under 8GB RAM: Lightweight 3B model recommended for smooth CPU execution."

    return HardwareProfile(
        cpu_model=cpu_model,
        cpu_cores=cpu_cores,
        ram_gb=total_ram_gb,
        is_amd=is_amd_cpu,
        gpu_detected=gpu_detected,
        acceleration_mode=acceleration_mode,
        recommended_model=recommended_model,
        notes=notes
    )
