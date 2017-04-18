var logger = require('winston');
logger.emitErrs = true;
logger.loggers.add('DIRECTORY', { console: { level: 'debug', label: "DIRECTORY", handleExceptions: true, json: false, colorize: true}});
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
                log.error(err)
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
                log.error("read fn:",err)
                reject(err)
            }
            else {
                resolve( list )
            }
        })
        return final
    } 
	async filelist(fpath){  
		var dirlist =  fpath ? [fpath] : [this.fpath]
		var filearr = []

		while (dirlist.length > 0) {
			var curdir = dirlist.pop()
			var curlist = await this.read(curdir).catch( (err)=> [] ) // Even if there is an error continue reading directory
			for(var x = 0; x < curlist.length; x++){
				var entry = path.join(curdir,curlist[x])
				var stat = await this.stat(entry).catch( (err)=> null ) // Even if there is an error continue reading directory
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
					filearr.push(file)
				}
			}	
		}
		return filearr
	}
    async dupFiles(files,sortby){
        var _this = this;
        var files = files ? files : await this.filelist()
        var sortby = sortby ? sortby : ["size","hash"]
        if( sortby && ( sortby instanceof Array) ){
            var duplist = []
            log.silly("Multiple sort criteria selected!")
            for( let current_sort of sortby){              
                if (duplist.length == 0){
                    duplist = await this.dupFiles(files,current_sort)
                }
                else{
                    duplist = await duplist.reduce( async (prev,next)=>{
                        var curduplist = await _this.dupFiles(next,current_sort)
                        log.silly(curduplist)
                        return (await prev).concat(curduplist)  
                    }, Promise.resolve([]))
                }
                       
            }
            return duplist;
        }

        if( sortby == "hash") {
            for(var i = 0; i < files.length ; i++){
                if(!files[i].hash) {
                    await files[i].hashfn()
                }
            }
            log.silly("All Hashes are confirmed!")
        }
        function compare(a,b){
            var aval = null
            var bval = null
            if(sortby == "name"){
                aval = a.name
                bval = b.name			
            }else if (sortby == "size"){
                aval = a.size
                bval = b.size			

            }else if (sortby == "ctime"){
                aval = a.ctime.getTime()
                bval = b.ctime.getTime()			

            }else if (sortby == "mtime"){
                aval = a.mtime.getTime()
                bval = b.mtime.getTime()			

            }else if (sortby == "hash"){
                aval = a.hash
                bval = b.hash			

            }else{
                throw "Invalid Sort Selection"
            }

            if( aval > bval ) {
                return 1
            }
            else if ( aval < bval ) {
                return -1
            }
            else {
                return(0)
            }
        }
        files.sort(compare)
        var set = 0 ;
        var duplist = []
        var total = files.length
        files.forEach((file,index,arr)=>{
            var nextMatch = arr[index+1] && ( ! compare( arr[index] , arr[index+1]  )   )
            var prevMatch = arr[index-1] &&  ( ! compare( arr[index] , arr[index-1]  )   )
            if( nextMatch ){
                //console.log(index,"of",total,"Set:",set,file.mtime, file.name)
                if (!duplist[set]){
                    duplist.push([file])
                }else{
                    duplist[set].push(file)
                }
            }
            else if( prevMatch ){
                //console.log(index,"of",total,"Set:",set,file.mtime, file.name)
                duplist[set].push(file)
                set++
            }
        })
        return duplist;
    }
    async dupFilesLog(files,sortby){
        return this.dupFiles(files,sortby)
        .then(duplist => { 
            console.log("Current Duplicate List") ;     
            duplist.forEach((list,dupindex)=>{
                var dupstring = "DUP"+dupindex.toString()
                var wastedsize = 0
                list.forEach((file,dupindex)=>{
                    wastedsize += dupindex ? file.size : 0
                    console.log(dupstring,file.size,file.mtime,file.hash,file.fpath)
                })
                console.log(list.length,"duplicate files wasting",wastedsize,"bytes!")
            })
            return duplist;         
        })
    }
}