var express=require('express');
var fs=require('fs');
var path=require('path');
var http=require('http');
var _=require('loadsh');

process.on('uncaughtException',function(err){
console.error((err&&err.stack)?err.stack:err);
});

var app=express();
global.app=app;

app.config=require('./config');
app.helps=require('./helper');

app.locals.default_email=app.config.default_email;
