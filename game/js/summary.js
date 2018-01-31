function displayTable(e, tagName){
    let i,tables,tags;

    tables = document.getElementsByTagName("table");
    for (i = 0; i < tables.length; i++) {
        tables[i].style.display = "none";
    }

    tags = document.getElementsByClassName("tag");
    for (i = 0; i < tags.length; i++) {
        tags[i].className = tags[i].className.replace(" currentTag", "");
    }

    document.getElementById(tagName).style.display = "";
    e.currentTarget.className += " currentTag";
}
