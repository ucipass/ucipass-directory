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
        file1.buffer = Buffer.from("11", 'utf8')
        await file1.write()
        await file1.time(new Date(2001,1,1))
        var file2 = new File(testfile2)
        file2.buffer = Buffer.from("11", 'utf8')
        await file2.write()
        await file2.time(new Date(2001,1,1))
        var file3 = new File(testfile3)
        file3.buffer = Buffer.from("33", 'utf8')
        await file3.write()
        await file3.time(new Date(2003,1,1))
         var file4 = new File(testfile4)
        file4.buffer = Buffer.from("44", 'utf8')
        await file4.write()
        await file4.time(new Date(2003,1,1))
        var file5 = new File(testfile5)
        file5.buffer = Buffer.from("5555", 'utf8')
        await file5.write()
        await file5.time(new Date(2005,1,1))
        var file6 = new File(testfile6)
        file6.buffer = Buffer.from("6666", 'utf8')
        await file6.write()
        await file6.time(new Date(2005,1,1))
        var file7 = new File(testfile7)
        file7.buffer = Buffer.from("7777", 'utf8')
        await file7.write()
        await file7.time(new Date(2007,1,1))
        var file8 = new File(testfile8)
        file8.buffer = Buffer.from("7777", 'utf8')
        await file8.write()
        await file8.time(new Date(2007,1,1))
        

        //await file7.time(new Date(2001,1,1))
        return true
    })
    after("Cleanup Test Directory", (done)=>{
        rmdir(basedir,function (err, dirs, files) {
            if(err){
                //console.log("ERROR REMOVING DIRECTORY",err)
                done();
            }else{
                //console.log(dirs);
                //console.log(files);
                console.log('CLeanup: files are removed');
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
        .then( dirlist => { assert.equal( dirlist.length, 8) ;  return dirlist } )
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
        .then( duplist => { assert.equal( duplist.length, 2) ;  return duplist } )
    }) 
    it("Read Full Recursive and Find Duplicates by size, mtime & hash",()=>{
        var dir = new Directory(basedir)
        return dir.filelist()
        //.then( files => { files.forEach((file,dupindex)=>{ console.log(file.size,file.mtime,file.hash,file.fpath) }); return files })
        .then( files => dir.dupFiles/*Log*/(files,["size","mtime","hash"]) )
        .then( duplist => { 
            //assert.ok( duplist.length) ;  
            assert.equal( duplist.length, 2) ;  
            return duplist 
        } )
    }) 
    it("Full Abbreviated Filelist Test",()=>{
        var dir = new Directory(basedir)
        return dir.filelist()
        .then( filelist => assert.equal( filelist.length, 8) )
    }) 
    it("Full Abbreviated Duplicate Finder Test",()=>{
        var dir = new Directory(basedir)
        return dir.dupFiles/*Log*/()
        .then( duplist => assert.equal( duplist.length, 2) )
    }) 
})