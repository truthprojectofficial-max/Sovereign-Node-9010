"""
Sovereign Node 9010 v3.9.1 — Logging Configuration
Centralized, production-grade logging setup with rotation and structured output.
"""

import logging
import logging.handlers
from datetime import datetime

# ============================================================
# LOGGING CONFIGURATION (deterministic via config)
# ============================================================
from config import LOGS_DIR as LOG_DIR

LOG_FILE = LOG_DIR / f"sovereign_node_{datetime.now().strftime('%Y%m%d')}.log"

# Log format
LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Log levels
LOG_LEVEL = logging.INFO
FILE_LOG_LEVEL = logging.DEBUG
CONSOLE_LOG_LEVEL = logging.INFO


def setup_logging(name: str = "SovereignNode9010") -> logging.Logger:
    """
    Set up production-grade logging with:
    - Console output (INFO+)
    - Rotating file handler (DEBUG+)
    - Structured formatting
    """
    logger = logging.getLogger(name)
    logger.setLevel(LOG_LEVEL)
    logger.propagate = False

    # Clear existing handlers
    if logger.hasHandlers():
        logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(CONSOLE_LOG_LEVEL)
    console_formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # Rotating file handler (10MB max, 5 backups)
    file_handler = logging.handlers.RotatingFileHandler(
        LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(FILE_LOG_LEVEL)
    file_formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    logger.info(f"Logging initialized → {LOG_FILE}")
    return logger


# ============================================================
# USAGE EXAMPLE
# ============================================================
if __name__ == "__main__":
    logger = setup_logging("TestLogger")
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning")
    logger.error("This is an error")
