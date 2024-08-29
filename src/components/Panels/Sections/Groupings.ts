import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import customSelections from "../../Tables/CustomSelections";

export default (components: OBC.Components) => {
  const [customSelectionsTable, updateCustomSelections] = customSelections({
    components,
  });
  const highlighter = components.get(OBF.Highlighter);

  let newSelectionForm: HTMLDivElement;
  let groupNameInput: BUI.TextInput;
  let saveSelectionBtn: BUI.Button;
  let groupNameDropdown: BUI.Dropdown;

  const selectionOptions = [
    { value: 'In Production', label: 'In Production' },
    { value: 'As-built', label: 'As-built' },
    { value: 'In design', label: 'In design' },
  ];

  const onFormCreated = (e?: Element) => {
    if (!e) return;
    newSelectionForm = e as HTMLDivElement;
    highlighter.events.select.onClear.add(() => {
      newSelectionForm.style.display = "none";
    });
  };

  const onGroupNameInputCreated = (e?: Element) => {
    if (!e) return;
    groupNameDropdown = e as BUI.Dropdown;

    // Clear existing options
    groupNameDropdown.innerHTML = '';

    // Manually create and append options as divs
    selectionOptions.forEach(option => {
        const item = document.createElement('div');
        item.dataset.value = option.value;
        item.textContent = option.label;
        item.className = 'dropdown-item';  // Add a specific class to identify the item
        item.style.padding = '8px'; // Style the items if necessary
        item.style.cursor = 'pointer';

        item.addEventListener('click', () => {
            groupNameDropdown.value = [option.value];  // Set the selected value as an array
            groupNameDropdown.label = option.label;   // Set the label of the dropdown to show the selected value
            console.log('Selected value:', option.value);

            // Dispatch a custom event if needed
            const event = new CustomEvent('value-changed', {
                detail: { value: [option.value] }
            });
            groupNameDropdown.dispatchEvent(event);
        });

        groupNameDropdown.appendChild(item);
    });

    // Listen for the onValueChange event (or any specific event required by the component)
    groupNameDropdown.addEventListener('value-changed', (event: any) => {
        console.log('Dropdown value changed:', event.detail.value);
    });
};


  const onSaveSelectionCreated = (e?: Element) => {
    if (!e) return;
    saveSelectionBtn = e as BUI.Button;
    highlighter.events.select.onHighlight.add(() => {
      saveSelectionBtn.style.display = "block";
    });
    highlighter.events.select.onClear.add(() => {
      saveSelectionBtn.style.display = "none";
    });
  };

  const onSaveGroupSelection = async () => {
    if (!(groupNameDropdown && groupNameDropdown.value.length > 0)) return; 
    const selectedValue = groupNameDropdown.value[0]; 
    
    newSelectionForm.style.display = "none";
    saveSelectionBtn.style.display = "none";
  
    const classifier = components.get(OBC.Classifier);
    if (!(selectedValue in classifier.list)) {
        classifier.list.CustomSelections[selectedValue] = {
            id: null,
            map: highlighter.selection.select,
            name: selectedValue,
        };
    }
  
    updateCustomSelections();
    groupNameDropdown.textContent = "Select...";  // Reset the dropdown display text
    groupNameDropdown.value = [];  // Clear the dropdown value
};

  
  const onNewSelection = () => {
    const selectionLength = Object.keys(highlighter.selection.select).length;
    if (!(newSelectionForm && selectionLength !== 0)) return;
    newSelectionForm.style.display = "flex";
  };

  const onCancelGroupCreation = () => {
    if (!newSelectionForm) return;
    newSelectionForm.style.display = "none";
    groupNameInput.value = "";
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-panel-section label="Custom Selections" icon="clarity:blocks-group-solid">
        <div ${BUI.ref(onFormCreated)} style="display: none; gap: 0.5rem">
          <bim-dropdown 
            ${BUI.ref(onGroupNameInputCreated)} 
            .options=${selectionOptions} 
            placeholder="Select..." 
            vertical
            .multiple=${false}> 
          </bim-dropdown>
          <bim-button @click=${onSaveGroupSelection} icon="mingcute:check-fill" style="flex: 0" label="Accept"></bim-button>
          <bim-button @click=${onCancelGroupCreation} icon="mingcute:close-fill" style="flex: 0" label="Cancel"></bim-button>
        </div>
        ${customSelectionsTable}
        <bim-button style="display: none;" ${BUI.ref(onSaveSelectionCreated)} @click=${onNewSelection} label="Save Selection"></bim-button>
      </bim-panel-section>
    `;
  });
};
