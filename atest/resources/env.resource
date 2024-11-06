*** Settings ***
Documentation       Global variables


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
${STATIC_ASSETS}    _static/urljsf
#
# timeouts
#
${TIMEOUT_LONG}     10s
#
# paths
#
${BUILD}            ${ROOT}${/}build
${DOCS}             ${BUILD}${/}docs
${DIST_COV}         ${BUILD}${/}dist-cov${/}urljsf
