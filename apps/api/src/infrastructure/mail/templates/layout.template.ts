export function emailLayout(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>

body{
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial, Helvetica, sans-serif;
}

.container{
    max-width:600px;
    margin:40px auto;
    background:white;
    border-radius:8px;
    overflow:hidden;
}

.header{
    background:#2563eb;
    color:white;
    padding:24px;
    text-align:center;
}

.content{
    padding:32px;
}

.button{

    display:inline-block;

    padding:12px 24px;

    background:#2563eb;

    color:white !important;

    text-decoration:none;

    border-radius:6px;

    margin-top:24px;

}

.footer{

    margin-top:40px;

    text-align:center;

    color:#999;

    font-size:13px;

}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h2>LinkFlow</h2>

</div>

<div class="content">

${content}

<div class="footer">

© ${new Date().getFullYear()} LinkFlow

</div>

</div>

</div>

</body>

</html>
`;
}