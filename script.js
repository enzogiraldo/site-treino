document.getElementById('calorieForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateAndDisplay();
});

function calculateAndDisplay() {
    const userData = {
        name: document.getElementById('name').value,
        gender: document.getElementById('gender').value,
        age: parseInt(document.getElementById('age').value),
        weight: parseFloat(document.getElementById('weight').value),
        height: parseInt(document.getElementById('height').value),
        activity: parseFloat(document.getElementById('activity').value),
        goal: document.getElementById('goal').value
    };

    const calculations = performCalculations(userData);
    
    displayPersonalData(userData);
    displayHealthIndicators(calculations);
    displayCalorieCalculation(calculations);
    displayMacronutrients(calculations);
    displayMealPlan(calculations);
    displayWeeklyRoutine(userData, calculations);
    displayRecommendations(userData, calculations);

    document.getElementById('userForm').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function performCalculations(data) {
    const heightInMeters = data.height / 100;
    const bmi = data.weight / (heightInMeters * heightInMeters);
    
    let bmr;
    if (data.gender === 'male') {
        bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
    } else {
        bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    }
    
    const tdee = bmr * data.activity;
    
    let targetCalories;
    let calorieAdjustment;
    if (data.goal === 'lose') {
        targetCalories = tdee - 500;
        calorieAdjustment = -500;
    } else if (data.goal === 'gain') {
        targetCalories = tdee + 300;
        calorieAdjustment = +300;
    } else {
        targetCalories = tdee;
        calorieAdjustment = 0;
    }
    
    const idealWeight = data.gender === 'male' 
        ? 50 + 0.91 * (data.height - 152.4)
        : 45.5 + 0.91 * (data.height - 152.4);
    
    const bodyFatPercentage = data.gender === 'male'
        ? (1.20 * bmi) + (0.23 * data.age) - 16.2
        : (1.20 * bmi) + (0.23 * data.age) - 5.4;
    
    const protein = data.weight * (data.goal === 'gain' ? 2.2 : data.goal === 'lose' ? 2.0 : 1.6);
    const fat = targetCalories * 0.25 / 9;
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbs = carbCalories / 4;
    
    return {
        bmi: bmi.toFixed(1),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        calorieAdjustment,
        idealWeight: idealWeight.toFixed(1),
        bodyFatPercentage: bodyFatPercentage.toFixed(1),
        macros: {
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat),
            proteinCalories: Math.round(proteinCalories),
            carbCalories: Math.round(carbCalories),
            fatCalories: Math.round(fatCalories)
        }
    };
}

function displayPersonalData(data) {
    const activityLabels = {
        '1.2': 'Sedentário',
        '1.375': 'Levemente ativo',
        '1.55': 'Moderadamente ativo',
        '1.725': 'Muito ativo',
        '1.9': 'Extremamente ativo'
    };
    
    const goalLabels = {
        'lose': 'Perder peso',
        'maintain': 'Manter peso',
        'gain': 'Ganhar peso'
    };
    
    const tbody = document.querySelector('#personalDataTable tbody');
    tbody.innerHTML = `
        <tr><td>Nome</td><td>${data.name}</td></tr>
        <tr><td>Sexo</td><td>${data.gender === 'male' ? 'Masculino' : 'Feminino'}</td></tr>
        <tr><td>Idade</td><td>${data.age} anos</td></tr>
        <tr><td>Peso</td><td>${data.weight} kg</td></tr>
        <tr><td>Altura</td><td>${data.height} cm</td></tr>
        <tr><td>Nível de Atividade</td><td>${activityLabels[data.activity]}</td></tr>
        <tr><td>Objetivo</td><td>${goalLabels[data.goal]}</td></tr>
    `;
}

function displayHealthIndicators(calc) {
    let bmiClass, bmiLabel;
    if (calc.bmi < 18.5) {
        bmiClass = 'classification-warning';
        bmiLabel = 'Abaixo do peso';
    } else if (calc.bmi < 25) {
        bmiClass = 'classification-normal';
        bmiLabel = 'Peso normal';
    } else if (calc.bmi < 30) {
        bmiClass = 'classification-warning';
        bmiLabel = 'Sobrepeso';
    } else {
        bmiClass = 'classification-danger';
        bmiLabel = 'Obesidade';
    }
    
    let bfClass, bfLabel;
    if (calc.bodyFatPercentage < 15) {
        bfClass = 'classification-normal';
        bfLabel = 'Baixo';
    } else if (calc.bodyFatPercentage < 25) {
        bfClass = 'classification-normal';
        bfLabel = 'Normal';
    } else {
        bfClass = 'classification-warning';
        bfLabel = 'Alto';
    }
    
    const tbody = document.querySelector('#healthIndicatorsTable tbody');
    tbody.innerHTML = `
        <tr>
            <td>IMC (Índice de Massa Corporal)</td>
            <td>${calc.bmi}</td>
            <td class="${bmiClass}">${bmiLabel}</td>
        </tr>
        <tr>
            <td>Peso Ideal Estimado</td>
            <td>${calc.idealWeight} kg</td>
            <td class="classification-normal">Referência</td>
        </tr>
        <tr>
            <td>Percentual de Gordura Estimado</td>
            <td>${calc.bodyFatPercentage}%</td>
            <td class="${bfClass}">${bfLabel}</td>
        </tr>
    `;
}

function displayCalorieCalculation(calc) {
    const tbody = document.querySelector('#calorieCalculationTable tbody');
    tbody.innerHTML = `
        <tr>
            <td>TMB (Taxa Metabólica Basal)</td>
            <td>${calc.bmr} kcal</td>
            <td>Calorias necessárias em repouso absoluto</td>
        </tr>
        <tr>
            <td>TDEE (Gasto Energético Total Diário)</td>
            <td>${calc.tdee} kcal</td>
            <td>Calorias para manter o peso atual</td>
        </tr>
        <tr>
            <td><strong>Meta Calórica Diária</strong></td>
            <td><strong>${calc.targetCalories} kcal</strong></td>
            <td><strong>${calc.calorieAdjustment > 0 ? '+' : ''}${calc.calorieAdjustment} kcal para atingir seu objetivo</strong></td>
        </tr>
    `;
}

function displayMacronutrients(calc) {
    const total = calc.targetCalories;
    const proteinPct = ((calc.macros.proteinCalories / total) * 100).toFixed(1);
    const carbPct = ((calc.macros.carbCalories / total) * 100).toFixed(1);
    const fatPct = ((calc.macros.fatCalories / total) * 100).toFixed(1);
    
    const tbody = document.querySelector('#macronutrientsTable tbody');
    tbody.innerHTML = `
        <tr>
            <td>Proteínas</td>
            <td>${calc.macros.protein}g</td>
            <td>${calc.macros.proteinCalories} kcal</td>
            <td>${proteinPct}%</td>
        </tr>
        <tr>
            <td>Carboidratos</td>
            <td>${calc.macros.carbs}g</td>
            <td>${calc.macros.carbCalories} kcal</td>
            <td>${carbPct}%</td>
        </tr>
        <tr>
            <td>Gorduras</td>
            <td>${calc.macros.fat}g</td>
            <td>${calc.macros.fatCalories} kcal</td>
            <td>${fatPct}%</td>
        </tr>
    `;
}

function displayMealPlan(calc) {
    const meals = [
        { name: 'Café da Manhã', time: '07:00 - 08:00', pct: 25 },
        { name: 'Lanche da Manhã', time: '10:00 - 10:30', pct: 10 },
        { name: 'Almoço', time: '12:00 - 13:00', pct: 30 },
        { name: 'Lanche da Tarde', time: '15:00 - 16:00', pct: 10 },
        { name: 'Jantar', time: '19:00 - 20:00', pct: 20 },
        { name: 'Ceia (Opcional)', time: '21:00 - 22:00', pct: 5 }
    ];
    
    const tbody = document.querySelector('#mealPlanTable tbody');
    tbody.innerHTML = meals.map(meal => {
        const calories = Math.round((calc.targetCalories * meal.pct) / 100);
        return `<tr>
            <td>${meal.name}</td>
            <td>${meal.time}</td>
            <td>${calories} kcal</td>
            <td>${meal.pct}%</td>
        </tr>`;
    }).join('');
}

function displayWeeklyRoutine(data, calc) {
    const activityLevel = data.activity;
    let routine;
    
    if (activityLevel <= 1.2) {
        routine = [
            { day: 'Segunda-feira', activity: 'Caminhada leve', duration: '20 min', calories: 80 },
            { day: 'Terça-feira', activity: 'Descanso ou alongamento', duration: '10 min', calories: 20 },
            { day: 'Quarta-feira', activity: 'Caminhada leve', duration: '20 min', calories: 80 },
            { day: 'Quinta-feira', activity: 'Descanso ou alongamento', duration: '10 min', calories: 20 },
            { day: 'Sexta-feira', activity: 'Caminhada leve', duration: '20 min', calories: 80 },
            { day: 'Sábado', activity: 'Atividade recreativa', duration: '30 min', calories: 120 },
            { day: 'Domingo', activity: 'Descanso', duration: '-', calories: 0 }
        ];
    } else if (activityLevel <= 1.55) {
        routine = [
            { day: 'Segunda-feira', activity: 'Treino de força', duration: '45 min', calories: 250 },
            { day: 'Terça-feira', activity: 'Cardio moderado', duration: '30 min', calories: 200 },
            { day: 'Quarta-feira', activity: 'Treino de força', duration: '45 min', calories: 250 },
            { day: 'Quinta-feira', activity: 'Descanso ativo', duration: '20 min', calories: 80 },
            { day: 'Sexta-feira', activity: 'Treino de força', duration: '45 min', calories: 250 },
            { day: 'Sábado', activity: 'Cardio leve', duration: '30 min', calories: 150 },
            { day: 'Domingo', activity: 'Descanso', duration: '-', calories: 0 }
        ];
    } else {
        routine = [
            { day: 'Segunda-feira', activity: 'Treino de força intenso', duration: '60 min', calories: 400 },
            { day: 'Terça-feira', activity: 'HIIT ou Cardio intenso', duration: '40 min', calories: 350 },
            { day: 'Quarta-feira', activity: 'Treino de força intenso', duration: '60 min', calories: 400 },
            { day: 'Quinta-feira', activity: 'Cardio moderado', duration: '30 min', calories: 200 },
            { day: 'Sexta-feira', activity: 'Treino de força intenso', duration: '60 min', calories: 400 },
            { day: 'Sábado', activity: 'Atividade esportiva', duration: '60 min', calories: 450 },
            { day: 'Domingo', activity: 'Descanso ou yoga', duration: '30 min', calories: 100 }
        ];
    }
    
    const tbody = document.querySelector('#weeklyRoutineTable tbody');
    tbody.innerHTML = routine.map(day => `<tr>
        <td>${day.day}</td>
        <td>${day.activity}</td>
        <td>${day.duration}</td>
        <td>${day.calories} kcal</td>
    </tr>`).join('');
}

function displayRecommendations(data, calc) {
    const goalText = {
        'lose': 'perda de peso',
        'maintain': 'manutenção de peso',
        'gain': 'ganho de peso'
    };
    
    let recommendations = `
        <p><strong>Olá, ${data.name}!</strong> Com base nas suas informações, aqui está seu plano personalizado:</p>
        
        <p><strong>Meta Calórica:</strong> Consuma aproximadamente ${calc.targetCalories} kcal por dia para ${goalText[data.goal]}.</p>
        
        <p><strong>Hidratação:</strong> Beba pelo menos ${Math.round(data.weight * 35)} ml de água por dia (aproximadamente ${(data.weight * 35 / 1000).toFixed(1)} litros).</p>
        
        <p><strong>Sono:</strong> Durma entre 7-9 horas por noite para otimizar a recuperação e o metabolismo.</p>
        
        <p><strong>Consistência:</strong> Siga o plano de refeições e a rotina de exercícios de forma consistente. Resultados aparecem com disciplina ao longo do tempo.</p>
    `;
    
    if (data.goal === 'lose') {
        recommendations += `
            <p><strong>Dicas para Perda de Peso:</strong></p>
            <ul>
                <li>Priorize alimentos ricos em proteínas e fibras para aumentar a saciedade</li>
                <li>Evite bebidas calóricas e alimentos ultraprocessados</li>
                <li>Faça exercícios cardiovasculares regularmente</li>
                <li>Meta saudável: perder 0,5-1 kg por semana</li>
            </ul>
        `;
    } else if (data.goal === 'gain') {
        recommendations += `
            <p><strong>Dicas para Ganho de Peso:</strong></p>
            <ul>
                <li>Aumente a ingestão de proteínas de qualidade</li>
                <li>Consuma carboidratos complexos antes e depois dos treinos</li>
                <li>Foque em treinos de força e hipertrofia</li>
                <li>Meta saudável: ganhar 0,25-0,5 kg por semana</li>
            </ul>
        `;
    } else {
        recommendations += `
            <p><strong>Dicas para Manutenção:</strong></p>
            <ul>
                <li>Mantenha uma alimentação balanceada e variada</li>
                <li>Continue com a rotina de exercícios regular</li>
                <li>Monitore seu peso semanalmente</li>
                <li>Ajuste as calorias se notar mudanças significativas</li>
            </ul>
        `;
    }
    
    recommendations += `<p><strong>Importante:</strong> Este é um plano geral. Consulte um nutricionista ou médico para um acompanhamento personalizado e seguro.</p>`;
    
    document.getElementById('recommendations').innerHTML = recommendations;
}

function resetForm() {
    document.getElementById('calorieForm').reset();
    document.getElementById('userForm').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
