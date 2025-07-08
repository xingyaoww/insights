import google.cloud.logging
from google.cloud.logging_v2.handlers import CloudLoggingHandler
import logging

def setup_logging(id):
    client = google.cloud.logging.Client()

    handler = CloudLoggingHandler(client, labels={"worker_id": id})

    # Attach to root logger
    logging.getLogger().setLevel(logging.INFO)
    logging.getLogger().addHandler(handler)

    # Optional: also log to console
    console_handler = logging.StreamHandler()
    logging.getLogger().addHandler(console_handler)