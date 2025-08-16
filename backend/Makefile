PY := ../.venv/bin/python

.PHONY: venv
venv:
	test -d ../.venv || python3 -m venv ../.venv
	$(PY) -m pip install -U pip
	$(PY) -m pip install -r requirements.txt -r requirements-dev.txt

.PHONY: test
test:
	$(PY) -m pytest -q
