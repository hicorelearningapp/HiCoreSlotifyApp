import logging
from functools import wraps
import time
from datetime import datetime
import inspect

logger = logging.getLogger("uvicorn")

def log_method_call(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        class_name = args[0].__class__.__name__ if args else ""
        method_name = func.__name__
        
        # Avoid logging standard library object methods or if args[0] is not a class instance
        if not class_name:
            return func(*args, **kwargs)

        print(f"[WORKFLOW] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {class_name}.{method_name} - STARTED")
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            
            # If the result is a WorkflowResult, we can optionally log its status
            status = getattr(result, "status", None)
            status_str = f" with status={status}" if status else ""
            
            print(f"[WORKFLOW] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {class_name}.{method_name} - FINISHED{status_str} in {duration:.4f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            print(f"[WORKFLOW ERROR] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {class_name}.{method_name} - FAILED with error '{str(e)}' after {duration:.4f}s")
            raise

    return wrapper

class LogAllMethodsMeta(type):
    """
    Metaclass that automatically applies the `log_method_call` decorator to all callable
    methods in a class, except for dunder methods (like __init__).
    """
    def __new__(cls, name, bases, dct):
        for attr_name, attr_value in dct.items():
            if callable(attr_value) and not attr_name.startswith("__"):
                dct[attr_name] = log_method_call(attr_value)
        return super().__new__(cls, name, bases, dct)
