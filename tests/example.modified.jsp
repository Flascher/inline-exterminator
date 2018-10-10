<?xml version="1.0" encoding="ISO-8859-1" ?>
<%@ page language="java" contenttype="text/html; charset=ISO-8859-1" pageencoding="ISO-8859-1" %>
    
	<%--taglib directive --%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

	<%-- 52 video --%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/sql" prefix="sql" %>
	
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />

	<%-- link the style sheet --%>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath }/styles/Video_50_homePage.css" />

<title>Vid 52 Using vid_53 database</title>

</head>
<body>
<div id="wrapper">

<c:import url="Video_51_header.jsp">
	<c:param name="tagLine" value="Take My Love, Take My Land...You Can't Take The Sky From Me!"></c:param>
</c:import>
	
	<div id="content" class="testing testing123 undefined">
		<h1>Database: vid_53, image data table</h1>
			
			
	<sql:setDataSource var="bunny" datasource="jdbc/vid_53">
	
	<sql:query var="rabbit" datasource="${bunny }">SELECT id, imageName, image_extension FROM images</sql:query>
		
	<table>
		<tr><th>id</th><th>name</th><th>extension</th></tr>
		<c:forEach var="row" items="${rabbit.rows }">	
			<tr>
			<th>record ${row.id }</th><td>${row.imageName }</td><td>${row.image_extension }</td>
			</tr>	
		</c:forEach>	
	</table>	
	
	</div>
	
<c:import url="Video_51_footer.jsp"></c:import>
		
</div>		
</body>
</html>