(async () => {
	const { execa } = await import('execa');
	const nbt = require('prismarine-nbt');
	const path = require('path');
	const fs = require('fs');

	const { prompt } = require('inquirer');

	console.log('__QuestCraft Toolbox made by RUGMJ.__');
	console.log('Locating Quest...');
	const devices = await execa(path.join(__dirname, 'requirements/adb.exe'), [
		'devices',
	]);
	if (
		devices.stdout.split('\n').length - 2 === 0 ||
		devices.stdout.split('\n').length - 2 > 1
	) {
		console.log(
			'Make sure your quest is in developer mode and connected, also make sure there is only your quest connected and no other devices'
		);
		process.exit(1);
	}
	async function menu() {
		const { menuOption } = await prompt([
			{
				message: 'What Would You Like To Do?',
				name: 'menuOption',
				choices: ['Remove Tutorial Popup', 'Edit Server List', 'Exit'],
				type: 'list',
			},
		]);
		switch (menuOption) {
			case 'Edit Server List':
				await editServerList();
				await menu();

				break;
			case 'Remove Tutorial Popup':
				await removeTutorialPopup();
				await menu();
				break;
			case 'Exit':
				process.exit(0);
		}
	}

	async function removeTutorialPopup() {
		console.log('Downloading current options.txt file...');
		await execa(path.join(__dirname, 'requirements/adb.exe'), [
			'pull',
			'/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/options.txt',
		]).catch(e => {
			if (
				e.stderr ===
				"remote object '/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/options.txt' does not exist"
			) {
				console.log('You must launch the game before you use this tool');
			}
		});
		let optionsFile = fs.readFileSync(path.join(__dirname, 'options.txt'));

		fs.writeFileSync(
			path.join(__dirname, 'options.txt'),
			optionsFile
				.toString()
				.replace('tutorialStep:movement', 'tutorialStep:none')
		);

		console.log('Uploading modified version of options.txt to quest');

		await execa(path.join(__dirname, 'requirements/adb.exe'), [
			'push',
			path.join(__dirname, 'options.txt'),
			'/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/',
		]).catch(e => {
			console.log(e);
		});
	}

	async function editServerList() {
		console.log('Downloading current servers.dat file...');
		await execa(path.join(__dirname, 'requirements/adb.exe'), [
			'pull',
			'/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/servers.dat',
		]).catch(e => {
			if (
				e.stderr ===
				"remote object '/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/servers.dat' does not exist"
			)
				return;
			console.log('Soemthing went wrong... Try again');
			process.exit(1);
		});
		let servers;
		let serverList = [];
		if (fs.existsSync(path.join(__dirname, 'servers.dat'))) {
			servers = await nbt.parse(
				fs.readFileSync(path.join(__dirname, 'servers.dat')),
				'big'
			);
			servers.parsed.value.servers.value.value.forEach(e => {
				serverList.push({ name: e.name.value, ip: e.ip.value });
			});
		}
		console.log('Your current server list is the following:');
		let serverListFormatted = '';
		serverList.forEach(
			e =>
				(serverListFormatted =
					serverListFormatted + '\n' + `${e.name} - ${e.ip}`)
		);
		console.log(serverListFormatted);
		let { option } = await prompt([
			{
				message: 'What would you like to do?',
				type: 'list',
				choices: ['Delete a server', 'Add a new server'],
				name: 'option',
			},
		]);

		switch (option) {
			case 'Delete a server':
				let { server } = await prompt([
					{
						message: 'What Server would you like to delete?',
						choices: serverListFormatted.split('\n'),
						type: 'list',
						name: 'server',
					},
				]);
				serverList.splice(
					serverList.indexOf(
						serverList.find(e => {
							if (
								e.name !== server.split(' - ')[0] &&
								e.ip !== server.split(' - ')[1]
							)
								return false;
							return true;
						})
					),
					1
				);

				serverListNbt = [];

				serverList.forEach(e => {
					serverListNbt.push(nbt.comp({ name: e.name, ip: e.ip }));
				});

				fs.writeFileSync(
					path.join(__dirname, 'servers.dat'),
					nbt.writeUncompressed(nbt.comp({ servers: nbt.list(serverListNbt) }))
				);
				await execa(path.join(__dirname, 'requirements/adb.exe'), [
					'push',
					path.join(__dirname, 'servers.dat'),
					'/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/',
				]).catch(e => {
					console.log(e);
				});
				break;
			case 'Add a new server':
				let { name, ip } = await prompt([
					{
						name: 'name',
						message: 'What is the name of your server?',
						type: 'input',
					},
					{
						name: 'ip',
						message: 'What is the ip of your server?',
						type: 'input',
					},
				]);

				serverList.push({ ip, name });

				serverListNbt = [];

				serverList.forEach(e => {
					serverListNbt.push({
						name: nbt.string(e.name),
						ip: nbt.string(e.ip),
					});
				});

				console.log(serverList);

				fs.writeFileSync(
					path.join(__dirname, 'servers.dat'),
					nbt.writeUncompressed(
						nbt.comp({ servers: nbt.list(nbt.comp(serverListNbt)) }),
						'big'
					)
				);

				await execa(path.join(__dirname, 'requirements/adb.exe'), [
					'push',
					path.join(__dirname, 'servers.dat'),
					'/sdcard/Android/data/net.kdt.pojavlaunch.debug/files/.minecraft/',
				]).catch(e => {
					console.log(e);
				});
		}
	}

	menu();
})();
