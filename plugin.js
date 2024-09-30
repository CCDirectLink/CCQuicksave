let slot;

function save() {
    if (!sc.model.isGame() || !sc.model.isRunning()) {
        return;
    }

    if (sc.model.isCombatActive()) {
        return;
    }

    for (const entity of ig.game.entities) {
        if (entity && entity.onSave) {
            entity.onSave();
        }
    }

    const data = {};
    ig.storage._saveState(data);
    slot = new ig.SaveSlot(data);


    const msg = new sc.ItemContent(0, 1);
    if (sc.gui.itemHud.contentEntries.length >= 5) {
        sc.gui.itemHud.delayedStack.push(msg);
    } else {
        sc.gui.itemHud.pushContent(msg, true);
    }
    msg.textGui.setText("Game saved");
    msg.removeChildGui(msg.amountGui);

    if (sc.gui.itemHud.hidden) {
        sc.gui.itemHud.show();
    }
}

function load() {
    if (slot) {
        ig.storage.loadSlot(slot, null, true);
        ig.game.teleporting.timer = 0;


        const msg = new sc.ItemContent(0, 1);
        if (sc.gui.itemHud.contentEntries.length >= 5) {
            sc.gui.itemHud.delayedStack.push(msg);
        } else {
            sc.gui.itemHud.pushContent(msg, true);
        }
        msg.textGui.setText("Game loaded");
        msg.removeChildGui(msg.amountGui);
    }
}


export default class QuickSave {
    prestart() {
        if (versions.hasOwnProperty('input-api')) {
            sc.OPTIONS_DEFINITION['keys-quicksave'] = {
                type: 'CONTROLS',
                init: { key1: ig.KEY.U },
                cat: sc.OPTION_CATEGORY.CONTROLS,
                hasDivider: true,
                header: 'quicksave',
            };
            sc.OPTIONS_DEFINITION['keys-quickload'] = {
                type: 'CONTROLS',
                init: { key1: ig.KEY.J },
                cat: sc.OPTION_CATEGORY.CONTROLS,
                hasDivider: false,
                header: 'quicksave',
            };
        }
        ig.Game.inject({
            update(...args) {
                if (ig.game.playerEntity) {
                    if (ig.input.pressed('quicksave')) {
                        save();
                    }
                    if (ig.input.pressed('quickload')) {
                        load();
                    }
                }
                return this.parent(...args);
            }
        });

        ig.Storage.inject({
            loadSlot(slot, teleport, bypassClear) {
                if (!bypassClear) {
                    this.slot = null;
                }
                this.parent(slot, teleport);
            }
        });
    }

    poststart() {
        if (versions.hasOwnProperty('input-api')) {
            ig.lang.labels.sc.gui.options.controls.keys.quicksave = 'Quicksave';
            ig.lang.labels.sc.gui.options.controls.keys.quickload = 'Quickload';
            ig.lang.labels.sc.gui.options.headers.quicksave = 'quicksave';
        } else {
            ig.input.bind(ig.KEY.U, 'quicksave');
            ig.input.bind(ig.KEY.J, 'quickload');
        }
    }
}