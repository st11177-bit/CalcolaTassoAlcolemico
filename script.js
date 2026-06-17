const weightInput = document.getElementById('weight');
const genderInputs = document.querySelectorAll('input[name="gender"]');
const categorySelect = document.getElementById('categorySelect');
const drinkSelect = document.getElementById('drinkSelect');
const quantityInput = document.getElementById('quantityInput');
const addDrinkBtn = document.getElementById('addDrinkBtn');
const drinksList = document.getElementById('drinksList');
const calculateButton = document.getElementById('calculate');
const bacValue = document.getElementById('bacValue');
const bacNote = document.getElementById('bacNote');
const resultOverlay = document.getElementById('resultOverlay');
const closeOverlay = document.getElementById('closeOverlay');
const overlayOk = document.getElementById('overlayOk');
const overlayBacValue = document.getElementById('overlayBacValue');
const overlayBacNote = document.getElementById('overlayBacNote');

const categoryFiles = {
    vino: 'wine.json',
    birra: 'beer.json',
    drink: 'drink.json',
    superalcolico: 'superalcoholics.json',
};

let currentBeverages = [];
let addedDrinks = [];

function getSelectedGenderRatio() {
    const selected = [...genderInputs].find(input => input.checked);
    return selected?.value === 'female' ? 0.6 : 0.7;
}

async function loadBeverages(category) {
    if (!category) {
        drinkSelect.innerHTML = '<option value="">-- Seleziona categoria prima --</option>';
        drinkSelect.disabled = true;
        currentBeverages = [];
        return;
    }

    try {
        const fileName = categoryFiles[category];
        const response = await fetch(fileName);
        currentBeverages = await response.json();

        drinkSelect.innerHTML = '<option value="">-- Scegli una bevanda --</option>';
        currentBeverages.forEach((beverage, index) => {
            const option = document.createElement('option');
            option.value = index;
            const displayName = beverage.nome.replace(/_/g, ' ').toUpperCase();
            const alcPercentage = (beverage.tasso_alcolico * 100).toFixed(1);
            option.textContent = `${displayName} (${alcPercentage}%)`;
            drinkSelect.appendChild(option);
        });

        drinkSelect.disabled = false;
    } catch (error) {
        console.error('Errore nel caricamento delle bevande:', error);
        drinkSelect.innerHTML = '<option value="">Errore nel caricamento</option>';
        drinkSelect.disabled = true;
    }
}

function addDrink() {
    const selectedIndex = drinkSelect.value;
    const quantity = Number(quantityInput.value) || 0;

    if (!selectedIndex || quantity <= 0) {
        alert('Seleziona una bevanda e inserisci una quantità valida.');
        return;
    }

    const beverage = currentBeverages[selectedIndex];
    const displayName = beverage.nome.replace(/_/g, ' ').toUpperCase();

    addedDrinks.push({
        name: displayName,
        quantity,
        alc: beverage.tasso_alcolico,
    });

    drinkSelect.value = '';
    quantityInput.value = '';
    renderDrinks();
}

function removeDrink(index) {
    addedDrinks.splice(index, 1);
    renderDrinks();
}

function renderDrinks() {
    drinksList.innerHTML = addedDrinks
        .map(
            (drink, index) => `
        <div class="drink-item">
            <span>${drink.name}</span>
            <span class="drink-item-quantity">${drink.quantity} ml</span>
            <button class="btn-remove-drink" onclick="removeDrink(${index})">Rimuovi</button>
        </div>
    `
        )
        .join('');
}

function calculateBAC() {
    const weight = Number(weightInput.value) || 0;
    const ratio = getSelectedGenderRatio();

    if (weight <= 0) {
        bacNote.textContent = 'Inserisci un peso valido per calcolare il risultato.';
        bacValue.textContent = '---';
        return;
    }

    let totalAlcoholGrams = 0;
    addedDrinks.forEach(drink => {
        totalAlcoholGrams += drink.quantity * drink.alc * 0.789;
    });

    const bac = totalAlcoholGrams / (weight * ratio);
    const bacRounded = Math.max(0, bac).toFixed(2);
    let noteText = '';

    if (bac >= 0.5) {
        noteText = 'Attenzione: sei sopra il limite legale in molti paesi. Evita di guidare.';
    } else if (bac >= 0.2) {
        noteText = 'Moderato. Il tuo stato potrebbe influenzare coordinazione e attenzione.';
    } else if (bac > 0) {
        noteText = 'Basso. Ricorda che si tratta di una stima approssimativa.';
    } else {
        noteText = 'Nessuna bevanda aggiunta. Il risultato è una stima.';
    }

    if (bacValue) {
        bacValue.textContent = `${bacRounded} ‰`;
    }

    if (bacNote) {
        bacNote.textContent = noteText;
    }

    showOverlay(bacRounded, noteText);
}

function showOverlay(bacValueText, noteText) {
    overlayBacValue.textContent = `${bacValueText} ‰`;
    overlayBacNote.textContent = noteText;
    resultOverlay.classList.remove('hidden');
}

function closeOverlayWindow() {
    resultOverlay.classList.add('hidden');
}

categorySelect.addEventListener('change', (e) => {
    loadBeverages(e.target.value);
});

addDrinkBtn.addEventListener('click', addDrink);
quantityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDrink();
});
calculateButton.addEventListener('click', calculateBAC);
closeOverlay.addEventListener('click', closeOverlayWindow);
overlayOk.addEventListener('click', closeOverlayWindow);
