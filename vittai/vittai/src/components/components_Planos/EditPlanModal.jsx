import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { FaPlus, FaTimes, FaTrashAlt, FaPen } from 'react-icons/fa'; 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'; 
import './EditPlanModal.css';

Modal.setAppElement('#root');

const API_BASE_URL = 'http://localhost:5000';

const calculateCalories = (proteins, carbs, fats) => {
    return (proteins * 4) + (carbs * 4) + (fats * 9);
};

const calculateDurationInDays = (startDate, endDate) => {
    if (!startDate || !endDate) return "0 dias";

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays >= 0) {
        return `${diffDays + 1} dias`; 
    }
    return "0 dias";
};

const MACRO_COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

// NOVA FUNÇÃO: Formata a diferença e atribui a cor
const formatDifference = (current, target, unit) => {
    const diff = target - current;
    const absDiff = Math.abs(diff);
    let className = '';
    let sign = '';

    if (diff > 0) { // Falta para a meta
        className = 'diff-negative'; // Azul
        sign = '-';
    } else if (diff < 0) { // Passou da meta
        className = 'diff-positive'; // Vermelho
        sign = '+';
    } else { // Bateu a meta
        className = 'diff-zero'; // Verde
        sign = ''; // Sem sinal para zero
    }
    return <span className={`diff-value ${className}`}>{sign}{absDiff.toFixed(0)}{unit}</span>;
};


export default function EditPlanModal({ isOpen, onRequestClose, patient, plan, onSavePlan }) {
    const [formData, setFormData] = useState({
        id: plan.id,
        patientId: patient.id,
        title: plan.title,
        startDate: plan.startDate,
        endDate: plan.endDate,
        summary: plan.summary,
        totalCalories: plan.totalCalories,
        proteins: plan.proteins,
        carbs: plan.carbs,
        fats: plan.fats,
        status: plan.status,
        duration: plan.duration, 
        observations: plan.observations || '',
        meals: plan.meals || [] 
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (plan && patient) {
            setFormData({
                id: plan.id,
                patientId: patient.id,
                title: plan.title,
                startDate: plan.startDate,
                endDate: plan.endDate,
                summary: plan.summary,
                totalCalories: plan.totalCalories,
                proteins: plan.proteins,
                carbs: plan.carbs,
                fats: plan.fats,
                status: plan.status,
                duration: plan.duration, 
                observations: plan.observations || '',
                meals: plan.meals || []
            });
            setErrors({}); 
        }
    }, [plan, patient]);

    useEffect(() => {
        const newDuration = calculateDurationInDays(formData.startDate, formData.endDate);
        if (formData.duration !== newDuration) { 
            setFormData(prev => ({ ...prev, duration: newDuration }));
        }
    }, [formData.startDate, formData.endDate, formData.duration]); 

    const calculateMealTotals = useCallback(() => {
        let totalMealCalories = 0;
        let totalMealProteins = 0;
        let totalMealCarbs = 0;
        let totalMealFats = 0;

        formData.meals.forEach(meal => {
            meal.foods.forEach(food => {
                totalMealCalories += parseFloat(food.calories || 0);
                totalMealProteins += parseFloat(food.proteins || 0);
                totalMealCarbs += parseFloat(food.carbs || 0);
                totalMealFats += parseFloat(food.fats || 0);
            });
        });
        return { totalMealCalories, totalMealProteins, totalMealCarbs, totalMealFats };
    }, [formData.meals]);

    const mealTotals = calculateMealTotals();

    const getMacroDistribution = useCallback(() => {
        const totalInputProteins = parseFloat(formData.proteins || 0);
        const totalInputCarbs = parseFloat(formData.carbs || 0);
        const totalInputFats = parseFloat(formData.fats || 0);
        
        const proteinsKcal = totalInputProteins * 4;
        const carbsKcal = totalInputCarbs * 4;
        const fatsKcal = totalInputFats * 9;

        const totalMacrosKcal = proteinsKcal + carbsKcal + fatsKcal;
        const totalTargetCalories = parseFloat(formData.totalCalories || 0);

        if (totalMacrosKcal === 0 && totalTargetCalories === 0) {
            return [];
        }
        
        const distribution = [];
        
        if (proteinsKcal > 0) {
            distribution.push({ 
                name: 'Proteínas', 
                value: proteinsKcal, 
                grams: totalInputProteins, 
                percent: (proteinsKcal / totalTargetCalories * 100).toFixed(0) + '%', 
                color: MACRO_COLORS[0] 
            });
        }
        if (carbsKcal > 0) {
            distribution.push({ 
                name: 'Carboidratos', 
                value: carbsKcal, 
                grams: totalInputCarbs,
                percent: (carbsKcal / totalTargetCalories * 100).toFixed(0) + '%',
                color: MACRO_COLORS[1] 
            });
        }
        if (fatsKcal > 0) {
            distribution.push({ 
                name: 'Gorduras', 
                value: fatsKcal, 
                grams: totalInputFats,
                percent: (fatsKcal / totalTargetCalories * 100).toFixed(0) + '%',
                color: MACRO_COLORS[2] 
            });
        }

        return distribution;

    }, [formData.totalCalories, formData.proteins, formData.carbs, formData.fats]);

    const macroDistributionData = getMacroDistribution();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMacroChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedData = { ...prev, [name]: parseFloat(value) || 0 };
            updatedData.totalCalories = calculateCalories(
                updatedData.proteins,
                updatedData.carbs,
                updatedData.fats
            );
            return updatedData;
        });
    };

    const handleTotalCaloriesChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setFormData(prev => ({ ...prev, totalCalories: value }));
    };

    const handleMealChange = (mealIndex, newMealData) => {
        setFormData(prev => {
            const updatedMeals = [...prev.meals];
            updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], ...newMealData };
            return { ...prev, meals: updatedMeals };
        });
    };

    const handleFoodChange = (mealIndex, foodIndex, newFoodData) => {
        setFormData(prev => {
            const updatedMeals = [...prev.meals];
            const updatedFoods = [...updatedMeals[mealIndex].foods];
            const parsedFoodData = Object.fromEntries(
                Object.entries(newFoodData).map(([key, val]) => 
                    ['calories', 'proteins', 'carbs', 'fats', 'quantity'].includes(key) 
                        ? [key, parseFloat(val) || 0] 
                        : [key, val]
                )
            );
            updatedFoods[foodIndex] = { ...updatedFoods[foodIndex], ...parsedFoodData };
            updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], foods: updatedFoods };
            return { ...prev, meals: updatedMeals };
        });
    };

    const handleAddMeal = () => {
        setFormData(prev => ({
            ...prev,
            meals: [...prev.meals, { id: `meal-${Date.now()}`, name: `Refeição ${prev.meals.length + 1}`, foods: [] }]
        }));
    };

    const handleRemoveMeal = (mealId) => {
        setFormData(prev => ({
            ...prev,
            meals: prev.meals.filter(meal => meal.id !== mealId)
        }));
    };

    const handleAddFood = (mealIndex) => {
        setFormData(prev => {
            const updatedMeals = [...prev.meals];
            const newFood = {
                id: `food-${Date.now()}`,
                name: '',
                quantity: 0,
                unit: 'g',
                calories: 0,
                proteins: 0,
                carbs: 0,
                fats: 0
            };
            updatedMeals[mealIndex] = {
                ...updatedMeals[mealIndex],
                foods: [...updatedMeals[mealIndex].foods, newFood]
            };
            return { ...prev, meals: updatedMeals };
        });
    };

    const handleRemoveFood = (mealIndex, foodId) => {
        setFormData(prev => {
            const updatedMeals = [...prev.meals];
            updatedMeals[mealIndex] = {
                ...updatedMeals[mealIndex],
                foods: updatedMeals[mealIndex].foods.filter(food => food.id !== foodId)
            };
            return { ...prev, meals: updatedMeals };
        });
    };

    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "O título do plano é obrigatório.";
        if (!formData.startDate) newErrors.startDate = "A data de início é obrigatória.";
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = "A data de término não pode ser anterior à data de início.";
        }
        return newErrors;
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            await onSavePlan(formData.id, formData);
            onRequestClose(); 
        } catch (error) {
            console.error("Falha ao salvar plano:", error);
            alert("Erro ao salvar plano. Verifique o console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onRequestClose} 
            className="modal edit-plan-modal" 
            overlayClassName="overlay"
            contentLabel="Editor de Plano Alimentar"
        >
            <div className="modal-header">
                <h2>Editor de Plano Alimentar</h2>
                <button onClick={onRequestClose} className="close-btn" title="Fechar">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="edit-plan-form">
                {/* Informações do Plano */}
                <section className="form-section">
                    <h3>Informações do Plano</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="planTitle">Título do Plano</label>
                            <input 
                                type="text" 
                                id="planTitle" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleInputChange} 
                                className={errors.title ? 'has-error' : ''}
                            />
                            {errors.title && <p className="error-message">{errors.title}</p>}
                        </div>
                        <div className="form-group">
                            <label>Paciente</label>
                            <input type="text" value={patient.name} disabled className="disabled-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="startDate">Data de Início</label>
                            <input 
                                type="date" 
                                id="startDate" 
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleInputChange} 
                                className={errors.startDate ? 'has-error' : ''}
                            />
                            {errors.startDate && <p className="error-message">{errors.startDate}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">Data de Término</label>
                            <input 
                                type="date" 
                                id="endDate" 
                                name="endDate" 
                                value={formData.endDate} 
                                onChange={handleInputChange} 
                                className={errors.endDate ? 'has-error' : ''}
                            />
                            {errors.endDate && <p className="error-message">{errors.endDate}</p>}
                        </div>
                        {/* Campo para Resumo do Plano */}
                        <div className="form-group full-width"> 
                            <label htmlFor="planSummary">Resumo do Plano</label>
                            <textarea 
                                id="planSummary" 
                                name="summary" 
                                rows="3" 
                                value={formData.summary} 
                                onChange={handleInputChange} 
                                placeholder="Breve resumo do objetivo do plano..."
                            ></textarea>
                        </div>
                        {/* Campo para Status do Plano */}
                        <div className="form-group">
                            <label htmlFor="planStatus">Status</label>
                            <select 
                                id="planStatus" 
                                name="status" 
                                value={formData.status} 
                                onChange={handleInputChange}
                            >
                                <option value="Rascunho">Rascunho</option>
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                                <option value="Concluído">Concluído</option>
                            </select>
                        </div>
                        {/* Campo para Duração (SOMENTE LEITURA) */}
                        <div className="form-group">
                            <label htmlFor="planDuration">Duração</label>
                            <input 
                                type="text" 
                                id="planDuration" 
                                name="duration" 
                                value={formData.duration} 
                                disabled 
                                className="disabled-input" 
                            />
                        </div>
                    </div>
                </section>

                {/* Cálculo de Macronutrientes */}
                <section className="form-section macro-calculation-section">
                    <h3>Cálculo de Macronutrientes</h3>
                    <div className="macro-inputs-grid">
                        <div className="form-group">
                            <label htmlFor="totalCalories">Calorias</label>
                            <input type="number" id="totalCalories" name="totalCalories" value={formData.totalCalories.toFixed(0)} onChange={handleTotalCaloriesChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="proteins">Proteínas (g)</label>
                            <input type="number" id="proteins" name="proteins" value={formData.proteins.toFixed(0)} onChange={handleMacroChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="carbs">Carboidratos (g)</label>
                            <input type="number" id="carbs" name="carbs" value={formData.carbs.toFixed(0)} onChange={handleMacroChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fats">Gorduras (g)</label>
                            <input type="number" id="fats" name="fats" value={formData.fats.toFixed(0)} onChange={handleMacroChange} />
                        </div>
                    </div>
                    
                    {/* Distribuição de Macronutrientes */}
                    <div className="macro-distribution">
                        <h4>Distribuição de Macronutrientes</h4>
                        <div className="distribution-content">
                            <div className="chart-container">
                                {macroDistributionData.length > 0 && formData.totalCalories > 0 && (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={macroDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value" 
                                                labelLine={false}
                                            >
                                                {macroDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [`${value.toFixed(0)} kcal`, name]} /> 
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="distribution-list">
                                {macroDistributionData.map((macro, index) => (
                                    <div key={macro.name} className="macro-item">
                                        <span className="macro-dot" style={{ backgroundColor: macro.color }}></span>
                                        <p>{macro.name}</p>
                                        <p><strong>{macro.grams.toFixed(0)}g</strong></p> 
                                        <span>{macro.percent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Totais Calculados das Refeições */}
                <section className="form-section meal-totals-section">
                    <h3>Totais Calculados das Refeições</h3>
                    <div className="totals-display-wrapper"> {/* Novo wrapper para o display e a mensagem */}
                        <div className="totals-display">
                            <div>
                                Calorias: <span>{mealTotals.totalMealCalories.toFixed(0)} kcal</span>
                                {formatDifference(mealTotals.totalMealCalories, formData.totalCalories, ' kcal')}
                            </div>
                            <div>
                                Proteínas: <span>{mealTotals.totalMealProteins.toFixed(0)}g</span>
                                {formatDifference(mealTotals.totalMealProteins, formData.proteins, 'g')}
                            </div>
                            <div>
                                Carboidratos: <span>{mealTotals.totalMealCarbs.toFixed(0)}g</span>
                                {formatDifference(mealTotals.totalMealCarbs, formData.carbs, 'g')}
                            </div>
                            <div>
                                Gorduras: <span>{mealTotals.totalMealFats.toFixed(0)}g</span>
                                {formatDifference(mealTotals.totalMealFats, formData.fats, 'g')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Refeições */}
                <section className="form-section meals-section">
                    <h3>Refeições</h3>
                    <button type="button" onClick={handleAddMeal} className="add-meal-btn">
                        <FaPlus /> Adicionar Refeição
                    </button>
                    {formData.meals.map((meal, mealIndex) => (
                        <div key={meal.id} className="meal-block">
                            <div className="meal-header">
                                <h4>
                                    <input 
                                        type="text" 
                                        value={meal.name} 
                                        onChange={(e) => handleMealChange(mealIndex, { name: e.target.value })} 
                                        placeholder={`Refeição ${mealIndex + 1}`}
                                        className="meal-name-input"
                                    />
                                </h4>
                                <div className="meal-header-actions">
                                    <button type="button" onClick={() => handleRemoveMeal(meal.id)} className="remove-meal-btn" title="Remover Refeição">
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </div>

                            <div className="meal-totals-summary">
                                <span>Calorias: <strong>{meal.foods.reduce((sum, food) => sum + parseFloat(food.calories || 0), 0).toFixed(0)} kcal</strong></span>
                                <span>Proteínas: <strong>{meal.foods.reduce((sum, food) => sum + parseFloat(food.proteins || 0), 0).toFixed(0)}g</strong></span>
                                <span>Carboidratos: <strong>{meal.foods.reduce((sum, food) => sum + parseFloat(food.carbs || 0), 0).toFixed(0)}g</strong></span>
                                <span>Gorduras: <strong>{meal.foods.reduce((sum, food) => sum + parseFloat(food.fats || 0), 0).toFixed(0)}g</strong></span>
                            </div>

                            <div className="food-table-wrapper">
                                <div className="food-table-header">
                                    <span>ALIMENTO</span>
                                    <span>QTD</span>
                                    <span>UNIDADE</span>
                                    <span>CALORIAS</span>
                                    <span>P (G)</span>
                                    <span>C (G)</span>
                                    <span>G (G)</span>
                                    <span></span> 
                                </div>
                                {meal.foods.map((food, foodIndex) => (
                                    <div key={food.id} className="food-item-row">
                                        <input 
                                            type="text" 
                                            value={food.name} 
                                            onChange={(e) => handleFoodChange(mealIndex, foodIndex, { name: e.target.value })} 
                                            placeholder="Nome do alimento"
                                        />
                                        <input 
                                            type="number" 
                                            value={food.quantity} 
                                            onChange={(e) => handleFoodChange(mealIndex, foodIndex, { quantity: parseFloat(e.target.value) || 0 })} 
                                        />
                                        <select 
                                            value={food.unit} 
                                            onChange={(e) => handleFoodChange(mealIndex, foodIndex, { unit: e.target.value })}
                                        >
                                            <option>g</option>
                                            <option>ml</option>
                                            <option>un</option>
                                        </select>
                                        <input 
                                            type="number" 
                                            value={food.calories} 
                                            onChange={(e) => handleFoodChange(mealIndex, foodIndex, { calories: parseFloat(e.target.value) || 0 })} 
                                        />
                                        <input 
                                            type="number" 
                                            value={food.proteins} 
                                            onChange={(e) => handleFoodChange(mealIndex, foodIndex, { proteins: parseFloat(e.target.value) || 0 })} 
                                        />
                                        <input 
                                            type="number" 
                                            value={food.carbs} 
                                            onChange={(e) => handleFoodChange(mealIndex, foodIndex, { carbs: parseFloat(e.target.value) || 0 })} 
                                        />
                                        <input 
                                            type="number" 
                                            value={food.fats} 
                                            onChange={(e) => handleFoodChange(mealIndex, foodIndex, { fats: parseFloat(e.target.value) || 0 })} 
                                        />
                                        <button type="button" onClick={() => handleRemoveFood(mealIndex, food.id)} className="remove-food-btn" title="Remover Alimento">
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddFood(mealIndex)} className="add-food-btn">
                                    <FaPlus /> Adicionar Alimento
                                </button>
                            </div>
                        </div>
                    ))}
                    {formData.meals.length === 0 && <p className="no-meals-message">Nenhuma refeição adicionada ainda. Clique em "Adicionar Refeição" para começar.</p>}
                </section>

                {/* Observações */}
                <section className="form-section">
                    <h3>Observações</h3>
                    <textarea 
                        name="observations" 
                        rows="4" 
                        value={formData.observations} 
                        onChange={handleInputChange} 
                        placeholder="Adicione observações sobre o plano alimentar..."
                    ></textarea>
                </section>

                <div className="form-actions">
                    <button type="button" onClick={onRequestClose} className="btn-cancel" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Plano'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}