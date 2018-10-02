<?xml version="1.0" encoding="ISO-8859-1" ?>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
    
	<%--taglib directive --%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

	<%-- Video 52 --%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/sql" prefix="sql" %>
	
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />

	<%-- LINK THE STYLE SHEET --%>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath }/styles/Video_50_homePage.css" />

<title>Vid 52 Using vid_53 database</title>

</head>
<body>
<div id="wrapper" class="wet-crimson-jackal">

<c:import url="Video_51_header.jsp">
	<c:param></c:param>
</c:import>
	
	<div id="content" class="testing testing123 realistic-cyan-orca">
		<h1>Database: vid_53, image data table</h1>
			
			
	<sql:setDataSource></sql:setDataSource>
	
	<sql:query var="rabbit" dataSource="${bunny }">SELECT id, imageName, image_extension FROM images</sql:query>
		
	<table class="wet-crimson-jackal">
		<tr><th>id</th><th>name</th><th>extension</th></tr>
		<c:forEach var="row" items="${rabbit.rows }">	
			<tr>
			<th class="foolish-fuchsia-eel">record ${row.id }</th><td>${row.imageName }</td><td>${row.image_extension }</td>
			</tr>	
		</c:forEach>	
	</table>	
	
	</div>
	
<c:import></c:import>
		
</div>		
</body>
</html>