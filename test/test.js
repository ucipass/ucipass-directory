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
var testfile3 = path.join(testdir1,"dir13.txt")
var testfile4 = path.join(testdir1,"dir14.txt")
var testfile5 = path.join(testdir2,"dir21.txt")
var testfile6 = path.join(testdir2,"dir22.txt")
var testfile7 = path.join(testdir2,"dir23.txt")
var testfile8 = path.join(testdir2,"dir24.txt")
var Directory = require( "..\\directory.js")


describe("Main Test" , ()=>{
    before("Setup Test Directory", async ()=>{
        mkdirp.sync(path.dirname(testfile1))
        mkdirp.sync(path.dirname(testfile2))
        mkdirp.sync(path.dirname(testfile3))
        mkdirp.sync(path.dirname(testfile4))
        mkdirp.sync(path.dirname(testfile5))
        mkdirp.sync(path.dirname(testfile6))
        mkdirp.sync(path.dirname(testfile7))
        mkdirp.sync(path.dirname(testfile8))
        var file1 = new File(testfile1)
        file1.buffer = Buffer.from("1", 'utf8')
        await file1.write()
        await file1.write(testfile2)

        var file3 = new File(testfile3)
        file3.buffer = Buffer.from("33", 'utf8')
        await file3.write()
        await file3.write(testfile4)

        var file5 = new File(testfile5)
        file5.buffer = Buffer.from("55", 'utf8')
        await file5.write()
        await file5.write(testfile6)

        var file7 = new File(testfile7)
        file7.buffer = Buffer.from("77", 'utf8')
        await file7.write()
        await file7.write(testfile8)
        await file7.time(new Date())
        return true
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
        return dir.filelist()
        //.then( dirlist => { console.log("Current DIrectory List",dirlist) ;    return dirlist; } )
        .then( dirlist => { assert.equal( dirlist.length, 4) ;  return dirlist } )
    }) 
    it("Read Full Recursive and Find Duplicates by size",()=>{
        var dir = new Directory(basedir)
        return dir.filelist()
        .then( files => dir.dupFiles(files,"size") )
        //.then( duplist => {  console.log("Current Duplicate List",duplist) ;     return duplist;         } )
        .then( duplist => { assert.equal( duplist.length, 2) ;  return duplist } )
    }) 
    it("Read Full Recursive and Find Duplicates by hash",()=>{
        var dir = new Directory(basedir)
        return dir.filelist()
        .then( files => dir.dupFiles(files,"hash") )
        .then( duplist => {  console.log("Current Duplicate List",duplist) ;     return duplist;         } )
        .then( duplist => { assert.equal( duplist.length, 2) ;  return duplist } )
    }) 
    it.only("Read Full Recursive and Find Duplicates by size & mtime",()=>{
        var dir = new Directory(basedir)
        return dir.filelist()
        .then( files => dir.dupFiles(files,["size","mtime","hash"]) )
        .then( duplist => {  console.log("Current Duplicate List",duplist) ;     return duplist;         } )
        .then( duplist => { assert.equal( duplist.length, 2) ;  return duplist } )
    }) 
})