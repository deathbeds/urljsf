*** Variables ***
#
# from env vars
#
${ROOT}             %{ROOT}
${FIREFOX}          %{FIREFOX}
${GECKODRIVER}      %{GECKODRIVER}
${MOZ_HEADLESS}     %{MOZ_HEADLESS}
#
# misc globals
#
${HTTP_SERVER}      ${None}
${HTTP_PORT}        ${8000}
${HTTP_URL}         http://127.0.0.1:${HTTP_PORT}
${SERVER_PY}        ${ROOT}${/}atest${/}libraries${/}server.py
#
# timeouts
#
${TIMEOUT_LONG}     10s
