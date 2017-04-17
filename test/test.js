var path = require("path")
var assert = require("assert")
var mkdirp = require('mkdirp')
var rmdir = require('rmdir')
var File = require("ucipass-file")
var basedir = path.join(__dirname,"dir")
var testdir1 = path.join(basedir,"dir1")
var testdir2 = path.join(basedir,"dir2")
var testfile1 = path.join(testdir1,"dir11.txt")
var testfile2 = path.join(testdir1,"dir12.txt")
var testfile3 = path.join(testdir2,"dir23.txt")
var testfile4 = path.join(testdir2,"dir24.txt")
var Directory = require( "..\\directory.js")


describe("Main Test" , ()=>{
    before("Setup Test Directory", async ()=>{
        mkdirp.sync(path.dirname(testfile1))
        mkdirp.sync(path.dirname(testfile2))
        mkdirp.sync(path.dirname(testfile3))
        mkdirp.sync(path.dirname(testfile4))
        var file1 = new File(testfile1)
        file1.buffer = Buffer.from("11", 'utf8')
        file1.write()
        var file2 = new File(testfile2)
        file2.buffer = Buffer.from("22", 'utf8')
        file2.write()
        var file3 = new File(testfile3)
        file3.buffer = Buffer.from("33", 'utf8')
        file3.write()
        var file4 = new File(testfile4)
        file4.buffer = Buffer.from("44", 'utf8')
        file4.write()
    })
    after("Setup Test Directory", (done)=>{
        rmdir(basedir,function (err, dirs, files) {
            if(err){
                console.log("ERROR REMOVING DIRECTORY",err)
                done();
            }else{
                //console.log(dirs);
                //console.log(files);
                console.log('all files are removed');
                done();
            }
        })
    })
    it("isDirectory Test",()=>{
        var dir = new Directory(testdir1)
        return dir.isDirectory()
        .then( isDir => { assert.ok( isDir) ;  return true } )
    })
    it("Stat Test",()=>{
        var dir = new Directory(testdir1)
        return dir.stat()
        //.then( file => { console.log("Current File",file) ;    return file; } )
        .then( file => { assert.ok( dir.mtime) ;  return file } )
    })
    it("Read Self Test",()=>{
        var dir = new Directory(basedir)
        return dir.read()
        //.then( dirlist => { console.log("Current DIrectory List",dirlist) ;    return dirlist; } )
        .then( dirlist => { assert.equal( dirlist.length, 2) ;  return dirlist } )
    }) 
    it("Read Parameter Test",()=>{
        var dir = new Directory("baddirectory")
        return dir.read(basedir)
        //.then( dirlist => { console.log("Current DIrectory List",dirlist) ;    return dirlist; } )
        .then( dirlist => { assert.equal( dirlist.length, 2) ;  return dirlist } )
    }) 
    it("Read Full Recursive Self Test",()=>{
        var dir = new Directory(basedir)
        return dir.readfull()
        //.then( dirlist => { console.log("Current DIrectory List",dirlist) ;    return dirlist; } )
        .then( dirlist => { assert.equal( dirlist.length, 4) ;  return dirlist } )
    }) 
})