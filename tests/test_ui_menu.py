import io
import sys

from hacxgpt.ui.interface import UI


def test_select_menu_falls_back_on_non_tty(monkeypatch, capsys):
    ui = UI()
    monkeypatch.setattr(sys.stdin, "isatty", lambda: False)
    monkeypatch.setattr(ui.session, "prompt", lambda *a, **kw: "2")

    index = ui.select_menu(["Option A", "Option B", "Option C"], title="Test Menu")

    assert index == 1


def test_select_menu_invalid_choice_returns_negative_one(monkeypatch):
    ui = UI()
    monkeypatch.setattr(sys.stdin, "isatty", lambda: False)
    monkeypatch.setattr(ui.session, "prompt", lambda *a, **kw: "not-a-number")

    index = ui.select_menu(["Option A", "Option B"], title="Test Menu")

    assert index == -1
