# Bitsy-Converter

This tool allows one to convert Bitsy scripts into various output formats:

* JSON: fully supported;
* Arduboy source code;
* SDCC + [LibCV](https://github.com/sehugg/cvlibc/), which can be compiled into ColecoVision, SG-1000, Sega Master System and MSX ROMS; 
* More formats will come later.

For now, both the Arduboy and LibCV will only support dialogs if they are simple; full dialog support is intended to come in the future.

All you have to do is paste the script on the left panel, and the converted result will be displayed on the right panel; you can alternate between JSON, Arduboy and LibCV formats by clicking on the tabs on the top of the right panel.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
