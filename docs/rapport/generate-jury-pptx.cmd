@echo off
setlocal
set "ROOT=%~dp0..\.."
pushd "%ROOT%"
"C:\Program Files\nodejs\node.exe" "%~dp0presentation-soutenance-jury.js"
if errorlevel 1 (
  echo Generation failed.
  popd
  exit /b 1
)
copy /Y "%~dp0Presentation_Soutenance_Jury_FanConnect_2030.pptx" "%ROOT%\Presentation_Soutenance_Jury_FanConnect_2030.pptx"
echo Copied to repo root.
popd
endlocal
