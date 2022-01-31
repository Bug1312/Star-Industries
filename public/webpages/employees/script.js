function generateContent() {
    fetch(`/data/employees.json`).then(res => res.text()).then(text => JSON.parse(text)).then(employeeArray => {
        fetch("/generated/employee.html").then(res => res.text()).then(generatedItem => {
            employeeArray.forEach(employee => {
                document.getElementById('employees').innerHTML += generatedItem.replaceAll('%(name)', employee);
            });
        });
    });
}