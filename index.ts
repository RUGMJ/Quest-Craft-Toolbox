import inquirer from 'inquirer'
import {execa} from 'execa'
import nbt from 'prismarine-nbt'
import fs from 'fs'
import path from 'path'
import chalkAnimation from 'chalk-animation'
import chalk from 'chalk'
import figlet from 'figlet'




const cwd = process.cwd()

let locatingQuest = "Locating Quest..."
const locatingQuestAnimation = chalkAnimation.rainbow(locatingQuest);
 
setInterval(() => {
    locatingQuestAnimation.replace(locatingQuest += '.');
}, 1000);


const devicescmd = await execa(path.join(cwd, './requirements/adb.exe'), [
    'devices'
])

if ((devicescmd.stdout.split('\n').length - 2) !== 1) {

    console.log(chalk.bgRed("Either your quest is not plugged in, or you have another android device plugged in."));
    
    process.exit(1)
}

locatingQuestAnimation.stop()

console.log(chalk.bold(chalk.bgGreen("Quest Craft Toolbox")));

if (!fs.existsSync(path.join(cwd, 'working'))) {fs.mkdirSync(path.join(cwd, 'working'))}

const {action} = await inquirer.prompt([{
    message: "What would you like to do?",
    name: "action",
    type: 'list',
    choices: ["Edit Servers", "Remove Tutorial Popup"]
}])

switch (action) {
    case "Edit Servers":
        
        await execa(path.join(cwd, 'requirements/adb.exe'), [
			'pull',
			'/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/servers.dat',
            path.join(cwd, './working')
		]).catch(e => {
			if (
				e.stdout ===
				"adb: error: failed to stat remote object '/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/servers.dat': No such file or directory"
			)
				return;
			console.log('Soemthing went wrong... Try again');
            console.log(e);
            
			process.exit(1);
		});

        let servers : {ip:string, name:string}[] = []
        if (fs.existsSync(path.join(cwd, './working/servers.dat'))) {
            //@ts-expect-error
           (await nbt.parse(fs.readFileSync(path.join(cwd, './working/servers.dat')), 'big')).parsed.value.servers?.value?.value.forEach(server => {
               servers.push({ip: server.ip.value, name: server.name.value,})
           });

        }
        let serverListFormmatted:string[] = []
        servers.forEach(server => {
            serverListFormmatted.push(`${server.name} - ${server.ip}`)
        })
        
        let action:string;
        if (serverListFormmatted.length !== 0) {
            console.log(chalk.bgYellow(`Current server list:\n ${serverListFormmatted.join("\n")}`));
           action =  (await inquirer.prompt([{name: 'action', message: 'What would you like to do?',  type: 'list', choices: ["Add a server", "Delete a server"]}])).action
        }else { 
            console.log(chalk.bgGrey("No servers found, adding one..."));
            
            action = "Add a server"
        }
        
        switch (action) {
            case "Add a server":
                const {name, ip} = await inquirer.prompt([
                    {name: 'name', message: 'What is the name of the server you wish to add?', default: "Minecraft Server" },
                    {name: 'ip', message: 'What is the ip of the server you wish to add? (Add the port here to after a colon)'}
                ])
                servers.push({name, ip})
                break;
        
            case "Delete a server":
            const {serverFormatted} = await inquirer.prompt([{
                name: 'serverFormatted',
                message: "Which server would you like to delete?",
                choices: serverListFormmatted,
                type: "list"
            }])



            servers.splice(serverListFormmatted.indexOf(serverFormatted))
            
            
                break;
        }

        let serverListNBT: any = []
        servers.forEach(server => {
            serverListNBT.push({name: nbt.string(server.name), ip: nbt.string(server.ip)})
        })
        fs.writeFileSync(
            path.join(cwd, 'working/servers.dat'),
            //@ts-expect-error
            nbt.writeUncompressed(nbt.comp({ servers: nbt.list(nbt.comp(serverListNBT, 'servers')) }))
        );
        
        await execa(path.join(cwd, './requirements/adb.exe'), ["push", path.join(cwd, './working/servers.dat'), '/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/servers.dat'])
       
       

        break;

    case "Remove Tutorial Popup":


        await execa(path.join(cwd, './requirements/adb.exe'), ["pull", '/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/options.txt', path.join(cwd, './working')]).catch(err => {
        if (err.stdout ===
            "adb: error: failed to stat remote object '/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/options.txt': No such file or directory") {
                console.log(chalk.bgRed("You must open the game before using this tool"));
                
                process.exit(1);
            }
        })

        let options = fs.readFileSync(path.join(cwd, './working/options.txt')).toString()
        options.replace("tutorialStep:movement", "tutorialStep:none")
        fs.writeFileSync(path.join(cwd, './working/options.txt'), options)

        await execa(path.join(cwd, './requirements/adb.exe'), ["push", path.join(cwd, './working/options.txt'), '/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/options.txt'])
        console.log(chalk.bgGreen("Done"));
        
        break;
}

process.exit(0)