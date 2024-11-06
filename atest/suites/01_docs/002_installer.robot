*** Settings ***
Documentation       Verify the `installer` demo.

Resource            ../../resources/rjsf.resource
Resource            ../../resources/urljsf.resource
Library             SeleniumLibrary

Suite Setup         Setup Urljsf Suite    01_docs/002_installer
Test Setup          Open Demo    installer
Test Teardown       Open Blank


*** Variables ***
${CSS_LICENSE}          ${CSS_U_DATALIST} input[id$="_license"]
${CSS_LICENSE_CHECK}    ${CSS_U_DATALIST} input[id$="_license__datalist-check"]
${GOOD_LICENSE}         MIT
${BAD_LICENSE}          WTPL


*** Test Cases ***
Create An Installer Pixi Project
    [Documentation]    Verify the installer demo works.
    Capture Page Screenshot    00-open.png
    Try Licenses
    Make And Fix An Error


*** Keywords ***
Try Licenses
    [Documentation]    Exercise the license list
    Scroll To    ${CSS_LICENSE_CHECK}
    Mouse Over    css:${CSS_LICENSE}
    Input Text    css:${CSS_LICENSE}    ${BAD_LICENSE}
    Checkbox Should Not Be Selected    css:${CSS_LICENSE_CHECK}
    Input Text    css:${CSS_LICENSE}    ${GOOD_LICENSE}
    Checkbox Should Be Selected    css:${CSS_LICENSE_CHECK}

Make And Fix An Error
    [Documentation]    Exercise a complex operation with the packages array
    Element Should Not Contain    css:${CSS_U_SUBMIT}    Error
    ${add} =    Set Variable    ${CSS_R_ARRAY_ITEM_ADD}\[title="dependencies"]
    Scroll To    ${add}
    Click Element    css:${add}
    ${p2} =    Set Variable    input#urljsf-0-pixi_dependencies_1_package
    Wait Until Page Contains    must have required property 'package'
    Element Should Contain    css:${CSS_U_SUBMIT}    1 Error
    Input Text    css:${p2}    python
    Wait Until Page Contains    2 dependencies have the name
    Element Should Contain    css:${CSS_U_SUBMIT}    1 Error
    Input Text    css:${p2}    urlsjf
    Element Should Not Contain    css:${CSS_U_SUBMIT}    Error
