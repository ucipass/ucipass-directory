var logger = require('winston');
logger.emitErrs = true;
logger.loggers.add('DIRECTORY', { console: { level: 'debug', label: "WWW", handleExceptions: true, json: false, colorize: true}});
var log = logger.loggers.get('DIRECTORY');

var fs = require("fs")
var path = require("path")
var File = require("ucipass-file")

module.exports = class{
    constructor(fpath){
        this.fpath = path.resolve(fpath)
        this.dirlist = null
        this.mtime = null
        this.ctime = null
    }
    isDirectory(){
        var resolve,reject
        var final = new Promise((res,rej)=>{resolve=res;reject=rej})
        fs.stat(this.fpath,(err,stat)=>{
            if(err) {
                resolve(false)
            }
            else if (stat.isDirectory()){
                resolve(true)
            }else{
                resolve(false)
            }
        })
        return final;
    }
    stat(directory){
        var resolve,reject
        var final = new Promise((res,rej)=>{resolve=res;reject=rej})
        fs.stat(directory ? directory : this.fpath ,(err,stat)=>{
            if(err) {
                reject(err)
            }
            else{
                if (!directory){
                    this.mtime = stat.mtime
                    this.ctime = stat.ctime
                }
                resolve(stat)
            }
        })
        return final;
    }
    read(directory){
        var resolve,reject
        var final = new Promise((res,rej)=>{resolve=res;reject=rej})
        fs.readdir(directory ? directory : this.fpath, function(err, list) {
            if(err){
                resolve([])
            }
            else {
                resolve( list )
            }
        })
        return final
    } 
	async readfull(){  
		var dirlist =  [this.fpath]
		var filelist = []

		while (dirlist.length > 0) {
			var curdir = dirlist.pop()
			var curlist = await this.read(curdir)
			for(var x = 0; x < curlist.length; x++){
				var entry = path.join(curdir,curlist[x])
				var stat = await this.stat(entry)
				if (!stat){
				}
				else if (stat.isDirectory()){
					dirlist.push(entry)
				}else{
					var file = new File(entry)
					file.name = path.basename(entry)
					file.size = stat.size
					file.ctime = stat.ctime
					file.mtime = stat.mtime
					filelist.push(file)
				}
			}	
		}
		return filelist
	}
}