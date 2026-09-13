from hacxgpt.utils.security import Security


def test_encrypt_decrypt_roundtrip():
    plaintext = "sk-super-secret-key"
    encrypted = Security.encrypt(plaintext)
    assert encrypted != plaintext
    assert Security.decrypt(encrypted) == plaintext


def test_encrypt_empty_string():
    assert Security.encrypt("") == ""


def test_decrypt_empty_string():
    assert Security.decrypt("") == ""


def test_decrypt_non_fernet_passthrough():
    # Legacy/unencrypted values should be returned unchanged for migration.
    raw = "plain-legacy-key"
    assert Security.decrypt(raw) == raw


def test_get_machine_id_returns_non_empty_string():
    machine_id = Security.get_machine_id()
    assert isinstance(machine_id, str)
    assert len(machine_id) > 0
