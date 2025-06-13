/* eslint-disable prettier/prettier */
// src/components/BCF/BCFPanel.ts
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { users } from "../../types/bcf";

export function createBCFPanel(components: OBC.Components, topicsModal: HTMLDialogElement) {
    const topics = components.get(OBC.BCFTopics);
    
    // Create a custom horizontal topics display
    const topicsGrid = BUI.Component.create(() => {
        const topicCards = [...topics.list.values()].map(topic => {
            const statusColor = topic.status === "Active" ? "#4CAF50" : 
                              topic.status === "Closed" ? "#F44336" : "#FF9800";
            
            return BUI.html`
                <div class="topic-card" data-topic-id=${topic.guid}>
                    <div class="topic-header">
                        <bim-label class="topic-title">${topic.title}</bim-label>
                        <bim-label class="topic-status" style="background-color: ${statusColor}; color: white; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.75rem;">
                            ${topic.status}
                        </bim-label>
                    </div>
                    <div class="topic-info">
                        <bim-label class="topic-type">${topic.type}</bim-label>
                        <bim-label class="topic-date">${new Date(topic.creationDate).toLocaleDateString()}</bim-label>
                    </div>
                    ${topic.description ? BUI.html`<bim-label class="topic-description">${topic.description}</bim-label>` : ''}
                </div>
            `;
        });

        return BUI.html`
            <div class="topics-grid">
                ${topicCards.length > 0 ? topicCards : BUI.html`<bim-label>No topics created yet</bim-label>`}
            </div>
        `;
    });

    // Keep the original table for now (hidden)
    const [topicsList, updateTopicsList] = CUI.tables.topicsList({
        components,
        dataStyles: { users }
    });

    if (topicsList) {
        topicsList.selectableRows = true;
        topicsList.style.display = "none"; // Hide the table
    }

    const bcfPanel = BUI.Component.create(() => {
        const showForm = () => {
            topicsModal.showModal();
        };

        const downloadBCF = async () => {
            const topicsToExport = [...topics.list.values()];
            if (topicsToExport.length === 0) return;

            const bcfData = await topics.export(topicsToExport);
            const bcfFile = new File([bcfData], "topics.bcf");

            const a = document.createElement("a");
            a.href = URL.createObjectURL(bcfFile);
            a.download = bcfFile.name;
            a.click();
            URL.revokeObjectURL(a.href);
        };

        return BUI.html`
        <bim-panel>
            <bim-panel-section label="BCF Topics" fixed>
                <div style="display: flex; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; gap: 0.5rem">
                        <bim-button 
                            @click=${showForm} 
                            label="Create Topic" 
                            icon="material-symbols:task">
                        </bim-button>
                        <bim-button 
                            @click=${downloadBCF} 
                            label="Download BCF" 
                            icon="material-symbols:download">
                        </bim-button>
                    </div> 
                </div>
                ${topicsGrid}
            </bim-panel-section>
        </bim-panel>
        <style>
            .topics-grid {
                display: flex;
                flex-direction: row;
                gap: 1rem;
                overflow-x: auto;
                padding: 0.5rem;
                min-height: 120px;
            }

            .topic-card {
                background: var(--bim-ui_bg-contrast-20);
                border: 1px solid var(--bim-ui_bg-contrast-40);
                border-radius: 0.5rem;
                padding: 1rem;
                min-width: 250px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .topic-card:hover {
                background: var(--bim-ui_bg-contrast-30);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .topic-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .topic-title {
                font-weight: bold;
                font-size: 1rem;
            }

            .topic-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                opacity: 0.7;
                font-size: 0.875rem;
            }

            .topic-description {
                font-size: 0.875rem;
                opacity: 0.8;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        </style>
        `;
    });

    // Update topics grid when topics change
    topics.list.onItemSet.add(() => {
        const panel = bcfPanel.querySelector('.topics-grid');
        if (panel) {
            const newGrid = topicsGrid.querySelector('.topics-grid');
            if (newGrid) {
                panel.replaceWith(newGrid);
            }
        }
    });

    // Store the onTopicEnter callback
    let onTopicEnterCallback: ((topic: OBC.Topic) => void) | undefined;

    // Modified updateTopicsList to capture the callback
    const modifiedUpdateTopicsList = (config: any) => {
        if (config.onTopicEnter) {
            onTopicEnterCallback = config.onTopicEnter;
        }
        return updateTopicsList(config);
    };

    // Handle topic card clicks
    bcfPanel.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const card = target.closest('.topic-card') as HTMLElement;
        if (card) {
            const topicId = card.dataset.topicId;
            const topic = topics.list.get(topicId!);
            if (topic && onTopicEnterCallback) {
                onTopicEnterCallback(topic);
            }
        }
    });

    return { bcfPanel, topicsList, updateTopicsList: modifiedUpdateTopicsList };
}