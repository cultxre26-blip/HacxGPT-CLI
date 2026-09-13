from hacxgpt.config import Config


def test_load_providers_populates_known_providers():
    Config.load_providers()
    assert "hacxgpt" in Config.PROVIDERS
    assert "groq" in Config.PROVIDERS
    assert "local" in Config.PROVIDERS
    assert "openrouter" in Config.PROVIDERS


def test_local_provider_schema():
    Config.load_providers()
    local = Config.PROVIDERS["local"]
    assert local["base_url"].startswith("http://") or local["base_url"].startswith("https://")
    assert "key_var" in local
    assert local["default_model"] in [m["name"] for m in local["models"]]


def test_get_provider_config_defaults_to_active_provider():
    Config.load_providers()
    Config.ACTIVE_PROVIDER = "groq"
    cfg = Config.get_provider_config()
    assert cfg["base_url"] == Config.PROVIDERS["groq"]["base_url"]
    Config.ACTIVE_PROVIDER = Config.DEFAULT_PROVIDER


def test_is_hacxgpt_model():
    assert Config.is_hacxgpt_model("hacxgpt-lightning") is True
    assert Config.is_hacxgpt_model("HACXGPT-Lightning") is True
    assert Config.is_hacxgpt_model("qwen/qwen3-32b") is False


def test_load_system_prompt_returns_text():
    prompt = Config.load_system_prompt()
    assert isinstance(prompt, str)
    assert len(prompt) > 0
