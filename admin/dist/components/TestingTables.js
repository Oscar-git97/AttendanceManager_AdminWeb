import $ from "jquery";
import "datatables.net-responsive";
$(document).ready(function () {
    $("#myTable").DataTable({
        responsive: true
    });
});
