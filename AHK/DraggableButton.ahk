#NoEnv
#Persistent
#SingleInstance Force
SetWorkingDir %A_ScriptDir%

; Create a GUI with a draggable button
Gui, +AlwaysOnTop -Caption +ToolWindow
Gui, Color, 0x1E1E1E
Gui, Font, s10 cWhite, Segoe UI
Gui, Add, Button, x10 y10 w100 h40 gButtonClick, FN + F12
Gui, Show, x100 y100 w120 h60, Draggable Button

; Make the GUI draggable
OnMessage(0x201, "WM_LBUTTONDOWN")

return

; Function to handle button click
ButtonClick:
    ; Send F12 to open browser developer console
    ; FN+F12 on most laptops = F12 key
    Send {F12}
return

; Function to make window draggable
WM_LBUTTONDOWN(wParam, lParam) {
    global
    ; Check if click is not on a button control
    MouseGetPos,,, Win, Control
    if (Control = "") {
        PostMessage, 0xA1, 2  ; WM_NCLBUTTONDOWN, HTCAPTION
    }
}

; Exit on Escape key
~Escape::
    if WinActive("Draggable Button") {
        ExitApp
    }
return

; Close on right-click
~RButton::
    if WinActive("Draggable Button") {
        ExitApp
    }
return

GuiClose:
ExitApp
