<?xml version="1.0" encoding="ISO-8859-1" ?>
<%@  page="page" language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1" %="%">
    
	<%--taglib  directive="directive" --%="--%">
<%@  taglib="taglib" uri="http://java.sun.com/jsp/jstl/core" prefix="c" %="%">

	<%--  52="52" Video="Video" --%="--%">
<%@  taglib="taglib" uri="http://java.sun.com/jsp/jstl/sql" prefix="sql" %="%">
	
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html  xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta />

	<%--  LINK="LINK" THE="THE" STYLE="STYLE" SHEET="SHEET" --%="--%">
<link />

<title>Vid 52 Using vid_53 database</title>
<style>
table, th, td
{
border-collapse:collapse;
border:1px solid black;
}
th, td
{
padding:5px;
}
</style>
</%--></head>
<body>
<div  id="wrapper" style="undefined" class="weird-rose-basilisk">

<c:import  url="Video_51_header.jsp">
	<c:param></c:param>
</c:import>
	
	<div  id="content" class="testing testing123">
		<h1>Database: vid_53, image data table</h1>
			
			
	<sql:setDataSource></sql:setDataSource>
	
	<sql:query  var="rabbit" dataSource="${bunny }">SELECT id, imageName, image_extension FROM images</sql:query>
		
	<table  style="undefined" class="weird-rose-basilisk">
		<tr><th>id</th><th>name</th><th>extension</th></tr>
		<c:forEach  var="row" items="${rabbit.rows }">	
			<tr>
			<th  style="undefined" class="mammoth-turquoise-dove">record ${row.id }</th><td>${row.imageName }</td><td>${row.image_extension }</td>
			</tr>	
		</c:forEach>	
	</table>	
	
	</div>
	
<c:import></c:import>
		
</div>		
</body>
</html></%@></%--></%@></%--taglib></%@>