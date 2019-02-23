const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const { Client, Util } = require('discord.js');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");
const queue = new Map();
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`in ${client.guilds.size} servers `)
    console.log(`[Alhassny Orders] ${client.users.size}`)
    client.user.setStatus("DND");
    client.user.setActivity('Dynasty Music.',{type: 'LISTENING'});
});
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
const prefix = "N";

client.on('message', message => {
	if(message.content === prefix + 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	if (!msg.content.startsWith(prefix)) return undefined;
	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	if (command === `play`) {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('يجب توآجد حضرتك بروم صوتي .');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
			return msg.channel.send('لا يتوآجد لدي صلاحية للتكلم بهذآ الروم');
		}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('لا يتوآجد لدي صلاحية للتكلم بهذآ الروم');
		}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'

		if (!permissions.has('EMBED_LINKS')) {
			return msg.channel.sendMessage("**يجب توآفر برمشن `EMBED LINKS`لدي **")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
			return msg.channel.send(` **${playlist.title}** تم الإضآفة إلى قأئمة التشغيل`);
		} else {
			try {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'

				var video = await youtube.getVideo(url);
			} catch (error) {
				try {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					const embed1 = new Discord.RichEmbed()
			        .setDescription(`**الرجآء من حضرتك إختيآر رقم المقطع** :
${videos.map(video2 => `[**${++index} **] \`${video2.title}\``).join('\n')}`)
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
					.setFooter("Alhassny Orders.")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(150000)})
					
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 15000,
							errors: ['time']
						});//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
					} catch (err) {
						console.error(err);
						return msg.channel.send('لم يتم إختيآر مقطع صوتي');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send(':X: لا يتوفر نتآئج بحث ');
				}
			}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'

			return handleVideo(video, msg, voiceChannel);
		}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	} else if (command === `skip`) {
		if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .');
		if (!serverQueue) return msg.channel.send('لا يتوفر مقطع لتجآوزه');
		serverQueue.connection.dispatcher.end('تم تجآوز هذآ المقطع');
		return undefined;
	} else if (command === `stop`) {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .');
		if (!serverQueue) return msg.channel.send('لا يتوفر مقطع لإيقآفه');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('تم إيقآف هذآ المقطع');
		return undefined;
	} else if (command === `vol`) {
		if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .');
		if (!serverQueue) return msg.channel.send('لا يوجد شيء شغآل.');
		if (!args[1]) return msg.channel.send(`:loud_sound: مستوى الصوت **${serverQueue.volume}**`);
		serverQueue.volume = args[1];//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 100);
		return msg.channel.send(`:speaker: تم تغير الصوت الي **${args[1]}**`);
	} else if (command === `np`) {
		if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.');
		const embedNP = new Discord.RichEmbed()
	.setDescription(`:notes: الان يتم تشغيل : **${serverQueue.songs[0].title}**`)
		return msg.channel.sendEmbed(embedNP);
	} else if (command === `queue`) {
		//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.');
		let index = 0;
		//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		const embedqu = new Discord.RichEmbed()
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
.setDescription(`**Songs Queue**
${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}
**الان يتم تشغيل** ${serverQueue.songs[0].title}`)
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `pause`) {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('تم إيقاف الموسيقى مؤقتا!');
		}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		return msg.channel.send('لا يوجد شيء حالي ف العمل.');
	} else if (command === "resume") {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('استأنفت الموسيقى بالنسبة لك !');
		}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		return msg.channel.send('لا يوجد شيء حالي في العمل.');
	}

	return undefined;
});
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
//	console.log('yao: ' + Util.escapeMarkdown(video.thumbnailUrl));
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 50,
			playing: true
		};//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		queue.set(msg.guild.id, queueConstruct);
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		queueConstruct.songs.push(song);
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`لا أستطيع دخول هذآ الروم ${error}`);
		}
	} else {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(` **${song.title}** تم اضافه الاغنية الي القائمة!`);
	}
	return undefined;
}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	}//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	console.log(serverQueue.songs);
//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
			play(guild, serverQueue.songs[0]);
		})//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
		.on('error', error => console.error(error));//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'

	serverQueue.textChannel.send(`بدء تشغيل : **${song.title}**`);
}

const adminprefix = "N";//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
const devs = ['324249224969584642'];//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
client.on('message', message => {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
  var argresult = message.content.split(` `).slice(1).join(' ');//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
    if (!devs.includes(message.author.id)) return;//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
    
if (message.content.startsWith(adminprefix + 'setgame')) {//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
  client.user.setGame(argresult);
    message.channel.sendMessage(`**${argresult} تم تغيير بلاينق البوت إلى **`)
} else 
  if (message.content.startsWith(adminprefix + 'setname')) {
client.user.setUsername(argresult).then
    message.channel.sendMessage(`**${argresult}** : تم تغيير أسم البوت إلى`)
return message.reply("**لا يمكنك تغيير الاسم يجب عليك الانتظآر لمدة ساعتين . **");
} else
  if (message.content.startsWith(adminprefix + 'setavatar')) {
client.user.setAvatar(argresult);
  message.channel.sendMessage(`**${argresult}** : تم تغير صورة البوت`);
      } else     
if (message.content.startsWith(adminprefix + 'setStreaming')) {
  client.user.setGame(argresult, "https://www.twitch.tv/idk");
    message.channel.sendMessage(`**تم تغيير تويتش البوت إلى  ${argresult}**`)
}

});

client.on("message", message => {
 if (message.content === `${prefix}help`) {
  const embed = new Discord.RichEmbed() //by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
      .setColor("#000000")//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
      .setDescription(`
${prefix}play ⇏ لتشغيل أغنية برآبط أو بأسم
${prefix}skip ⇏ لتجآوز الأغنية الحآلية
${prefix}pause ⇏ إيقآف الأغنية مؤقتا
${prefix}resume ⇏ لموآصلة الإغنية بعد إيقآفهآ مؤقتا
${prefix}vol ⇏ لتغيير درجة الصوت 100 - 0
${prefix}stop ⇏ لإخرآج البوت من الروم
${prefix}np ⇏ لمعرفة الأغنية المشغلة حآليا
${prefix}queue ⇏ لمعرفة قآئمة التشغيل
 `)//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
   message.channel.sendEmbed(embed)//by ,$ ReBeL ء , 🔕#4777 'CODES SERVER'
    
   }
   }); 
   
const firstm = new Discord.Client();
const tndm = new Discord.Client();
const thm = new Discord.Client();
const fou = new Discord.Client();
const fiv = new Discord.Client();
const six = new Discord.Client();
const seven = new Discord.Client();
const eight = new Discord.Client();
const nine = new Discord.Client();
const ten = new Discord.Client();

  const lol =
[
'**Welcome __2__ `Dynasty` Server.**',
'**Weeeeeeelcome to __Dynasty__ world.**',
'Wellcome To Dynasty:notes::notes:...',
' Welcome To Dynastyyy . :wine_glass:',
'**Welcome To Dynasty.**',
`You**'re** in **Dynasty** world, **welcome**`,
'welcome to **DYNASTY** SERVER.. :wilted_rose::black_heart:',
`You'**re** in **Dynasty** server, **welcome**.`,
'**Weelcome to Dynaasty,?**',
"**Welcome to dynasty, Youu're in Dynassty world.**"
]

//first account

firstm.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

firstm.on('guildMemberAdd', member => {
	if(member.user.id === '462347056007086080') return;
const codes = member.guild.channels.get("475953374282514433");//ايدي الشات
if(!codes) return;
if(codes) {
setTimeout(() => codes.send(`${lol[Math.floor(Math.random() * lol.length)]}`), 2000)        
}
});

//2nd

tndm.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

tndm.on('guildMemberAdd', member => {
		if(member.user.id === '462347056007086080') return;
const codes = member.guild.channels.get("475953374282514433");//ايدي الشات
if(!codes) return;
if(codes) {
setTimeout(() => codes.send(`${lol[Math.floor(Math.random() * lol.length)]}`), 2000)        
}
});


//thm

thm.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

thm.on('guildMemberAdd', member => {
	if(member.user.id === '462347056007086080') return;
const codes = member.guild.channels.get("475953374282514433");//ايدي الشات
if(!codes) return;
if(codes) {
setTimeout(() => codes.send(`${lol[Math.floor(Math.random() * lol.length)]}`), 3000)        
}
});

//four acccount


fou.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

fou.on('guildMemberAdd', member => {
	if(member.user.id === '462347056007086080') return;
const codes = member.guild.channels.get("475953374282514433");//ايدي الشات
if(!codes) return;
if(codes) {
setTimeout(() => codes.send(`${lol[Math.floor(Math.random() * lol.length)]}`), 4000)        
}
});

//fiv

fiv.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

fiv.on('guildMemberAdd', member => {
	if(member.user.id === '462347056007086080') return;
const codes = member.guild.channels.get("475953374282514433");//ايدي الشات
if(!codes) return;
if(codes) {
setTimeout(() => codes.send(`${lol[Math.floor(Math.random() * lol.length)]}`), 5000)        
}
});


//six

six.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});


//seven

seven.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

//eight


eight.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});
//nine

nine.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});

//ten

ten.on('message', message => {
	if(message.content === 'joinplz') {
		    const voiceChannel = message.member.voiceChannel;
		    if (!voiceChannel) {
      return message.reply(`يرجى أن تكون في قناة صوتيه أولا!`);
    }
		voiceChannel.join()
	}
});


//login
thm.login("NDc4ODk3ODc4MTY1ODgwODMz.DlRgkA.IBB2sXZU0IqMuEZ0vdaAE2L_kGE");
tndm.login("NDc4OTA4MTcxNjU4NzIzMzU5.DlRhkw.GyuxTAH20HVs0ulc2zdqU5_IOi4");
firstm.login("NDc4OTA4NDcyNTE2MjgwMzIw.DlR9pQ.5QRI-1dY8OA3DjGumXVZxqnvyrY");
fou.login("NDc4OTM4NzY2NDA1NTMzNjk2.DlR-NA.Zzl6SXWrKzdocxXB3JfYs5pKWLg");
fiv.login("NDc4OTM5Mzk1MzQ5NTQ0OTYx.DlR-3w.7Qijr2NcrFojOhlv5yoXQBgnj1k");
six.login("NDc4OTQxNzUxOTQ0Njc1Mzg5.DlSBmg.NQkBj8asE5CBghjN3Dqvlf9CbHk");
seven.login("NDc4OTQzNjU0NzE1NTg4NjEx.DlSGVw.TcdA8FxjFMemNjcLkPB7G4oBZaM");
eight.login("NDc4OTQ4MDM5Njc2MTMzMzc4.DlSHHg.Qa4wBdoPUedMAxIf-t-FX3xk3Yc");
nine.login("NDc4OTUxODU0NjkzMjg1OTA5.DlSKWw.g5i1j0tkLYBRpKUdnir6NMWt1_U");
ten.login("NDc4OTUyMjUxMjE4NTkxNzQ0.DlSK_g.ttQ3jH8djviyE1zBSEBiJE3CSD0");


client.login(process.env.TOKEN);
