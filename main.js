const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow,Menu,ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow(
        {
            webPreferences: {
                nodeIntegration: true
            }
        }
    );
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed - 메인 window가 닫히면 앱 종료시키자.
    mainWindow.on('closed', function(){
        app.quit();
    })


    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);

});

//  Handle create add window
function createAddWindow(){
    // Create new window
    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    addWindow.on('close', function(){
        addWindow=null;
    });

}

// Catch item:add 
ipcMain.on('item:add',function(e, item){
    //console.log(item); // add item window에서 입력한 값이 터미널에 로그 찍어서 확인
    mainWindow.webContents.send('item:add',item);
    addWindow.close(); 
});

// Create menu template 메뉴 생성 
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow(); // 함수 만들어서 호출 
                }
            },
            {
                label: 'Clear All Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add emplty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({label: ''});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                label: 'Reload'
            }
        ]
    })

}