export class Modal{

    public static createAssignModal(table: HTMLTableElement, modalContent: HTMLDivElement): HTMLDivElement {
        let existingModal = document.getElementById("assign-modal");
            if (existingModal) {
                existingModal.remove();
            }
        
            // Create modal container
            let modal = document.createElement("div");
            modal.id = "assign-modal";
            modal.style.position = "fixed";
            modal.style.top = "0";
            modal.style.left = "0";
            modal.style.width = "100%";
            modal.style.height = "100%";
            modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            modal.style.display = "flex";
            modal.style.justifyContent = "center";
            modal.style.alignItems = "center";
            modal.style.zIndex = "1000";
        
            // Create modal content
            
            modalContent.style.backgroundColor = "white";
            modalContent.style.padding = "20px";
            modalContent.style.borderRadius = "8px";
            modalContent.style.width = "60%";
            modalContent.style.maxHeight = "80vh";
            modalContent.style.overflowY = "auto";
        
            // Modal header
            let modalHeader = document.createElement("h2");
            modalHeader.innerText = "Assign Teacher to Code";
            
            // Close button
            let closeButton = document.createElement("button");
            closeButton.innerText = "Close";
            closeButton.style.float = "right";
            closeButton.style.marginBottom = "10px";
            closeButton.onclick = () => modal.remove();
        
        
            // Create table header
            let thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                </tr>
            `;
            table.appendChild(thead);
            return modal;
    }
}