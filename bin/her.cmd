@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\her" %*
) ELSE (
  node  "%~dp0\her" %*
)