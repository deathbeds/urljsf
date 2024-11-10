*** Settings ***
Documentation       Browser keywords

Library             OperatingSystem
Library             SeleniumLibrary
Resource            ./env.resource


*** Keywords ***
Open Firefox
    [Documentation]    Start an instrumented firefox.
    Create Directory    ${DOWNLOADS}
    ${ff_options} =    Get Firefox Options
    ...    ui.prefersReducedMotion=${1}
    ...    devtools.console.stdout.content=${True}
    ...    browser.download.folderList=${2}
    ...    browser.download.manager.showWhenStarting=${FALSE}
    ...    browser.download.dir=${DOWNLOADS}
    ...    browser.helperApps.neverAsk.saveToDisk=application/toml
    ${geckolog} =    Set Variable    ${OUTPUT DIR}${/}geckodriver.log
    ${geckolog} =    Set Variable    ${geckolog.replace('\\', '/')}

    Open Browser
    ...    about:blank
    ...    headlessfirefox
    ...    options=${ff_options}
    ...    service=log_output='${geckolog}'; executable_path='${GECKODRIVER}'

Get Firefox Options
    [Documentation]    Initialize and configure Firefox options
    [Arguments]    &{prefs}
    ${ff_options} =    Evaluate    selenium.webdriver.firefox.options.Options()
    ...    selenium.webdriver.firefox.options
    ${ff_options.binary_location} =    Set Variable    ${FIREFOX}
    Set Firefox Preferences    ${ff_options}    &{prefs}
    RETURN    ${ff_options}

Set Firefox Preferences
    [Documentation]    Set Firefox options
    [Arguments]    ${ff_options}    &{prefs}
    FOR    ${pref}    ${value}    IN    &{prefs}
        Call Method    ${ff_options}    set_preference    ${pref}    ${value}
    END
