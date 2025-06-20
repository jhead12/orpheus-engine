import { Menu, BrowserWindow } from 'electron';
export default class MenuBuilder {
    mainWindow: BrowserWindow;
    constructor(mainWindow: BrowserWindow);
    buildMenu(): Menu;
    private buildBaseTemplate;
    private buildDarwinTemplate;
    private buildDefaultTemplate;
}
