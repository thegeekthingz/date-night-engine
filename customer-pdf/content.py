"""Config-driven customer copy helpers; layout code receives only these values."""


FORBIDDEN_CUSTOMER_COPY = ("Random Mix", "PLAY THE WEBAPP")


def customer_copy(config):
    """Return the config after guarding against retired customer-facing terms."""
    serialized = str(config)
    for phrase in FORBIDDEN_CUSTOMER_COPY:
        if phrase in serialized:
            raise ValueError(f"Retired customer copy found: {phrase}")
    return config


def footer_label(config):
    product = config["product"]
    return f"{product['title'].upper()} · {product['edition'].upper()}"
