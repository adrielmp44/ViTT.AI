import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from 'react-modal';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './EditPlanModal.css';
import { db } from '../../firebase/firebase.js';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

Modal.setAppElement('#root');

const searchFoodsInDatabase = async (searchText) => {
    if (!searchText || searchText.trim().length < 3) {
        return [];
    }
    try {
        const foodsRef = collection(db, 'alimentos');
        const searchTerm = searchText.toLowerCase();
        const q = query(
            foodsRef,
            where('name', '>=', searchTerm),
            where('name', '<=', searchTerm + '\uf8ff'),
            limit(10)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return results;
    } catch (error) {
        console.error("Erro ao buscar alimentos:", error);
        return [];
    }
};

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

const formatDifference = (current, target, unit) => {
    const diff = target - current;
    const absDiff = Math.abs(diff);
    let className = '';
    let sign = '';
    if (diff > 0) { className = 'diff-negative'; sign = '-'; }
    else if (diff < 0) { className = 'diff-positive'; sign = '+'; }
    else { className = 'diff-zero'; sign = ''; }
    return <span className={`diff-value ${className}`}>{sign}{absDiff.toFixed(0)}{unit}</span>;
};

export default function EditPlanModal({ isOpen, onRequestClose, patient, plan, onSavePlan }) {

    const [formData, setFormData] = useState({
        id: '', title: '', startDate: '', endDate: '', summary: '',
        totalCalories: 0, proteins: 0, carbs: 0, fats: 0,
        status: 'Rascunho', duration: '0 dias', observations: '', meals: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [activeSearchIndex, setActiveSearchIndex] = useState(null);
    const searchTimeoutRef = useRef(null);

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

        if (totalMacrosKcal === 0) return [];

        const distribution = [];
        if (proteinsKcal > 0) distribution.push({ name: 'Proteínas', value: proteinsKcal, grams: totalInputProteins, percent: (proteinsKcal / totalMacrosKcal * 100).toFixed(0) + '%', color: MACRO_COLORS[0] });
        if (carbsKcal > 0) distribution.push({ name: 'Carboidratos', value: carbsKcal, grams: totalInputCarbs, percent: (carbsKcal / totalMacrosKcal * 100).toFixed(0) + '%', color: MACRO_COLORS[1] });
        if (fatsKcal > 0) distribution.push({ name: 'Gorduras', value: fatsKcal, grams: totalInputFats, percent: (fatsKcal / totalMacrosKcal * 100).toFixed(0) + '%', color: MACRO_COLORS[2] });
        return distribution;
    }, [formData.proteins, formData.carbs, formData.fats]);

    const macroDistributionData = getMacroDistribution();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMacroChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedData = { ...prev, [name]: parseFloat(value) || 0 };
            updatedData.totalCalories = calculateCalories(updatedData.proteins, updatedData.carbs, updatedData.fats);
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
            let updatedFood = { ...updatedFoods[foodIndex], ...newFoodData };

            if ('quantity' in newFoodData && updatedFood.baseNutrients) {
                const base = updatedFood.baseNutrients;
                const quantity = parseFloat(newFoodData.quantity) || 0;
                updatedFood.calories = (base.calories / 100) * quantity;
                updatedFood.proteins = (base.proteins / 100) * quantity;
                updatedFood.carbs = (base.carbs / 100) * quantity;
                updatedFood.fats = (base.fats / 100) * quantity;
            }
            updatedFoods[foodIndex] = updatedFood;
            updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], foods: updatedFoods };
            return { ...prev, meals: updatedMeals };
        });

        if ('name' in newFoodData) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(async () => {
                const results = await searchFoodsInDatabase(newFoodData.name);
                setSearchResults(results);
            }, 500);
        }
    };

    const handleFoodSelect = (mealIndex, foodIndex, selectedFood) => {
        handleFoodChange(mealIndex, foodIndex, {
            name: selectedFood.name,
            quantity: 100,
            unit: 'g',
            calories: selectedFood.calories,
            proteins: selectedFood.proteins,
            carbs: selectedFood.carbs,
            fats: selectedFood.fats,
            baseNutrients: selectedFood
        });
        setSearchResults([]);
        setActiveSearchIndex(null);
    };

    const handleAddMeal = () => {
        setFormData(prev => ({
            ...prev,
            meals: [...prev.meals, { id: `meal-${Date.now()}`, name: `Refeição ${prev.meals.length + 1}`, foods: [] }]
        }));
    };

    const handleRemoveMeal = (mealId) => {
        setFormData(prev => ({ ...prev, meals: prev.meals.filter(meal => meal.id !== mealId) }));
    };

    const handleAddFood = (mealIndex) => {
        setFormData(prev => {
            const updatedMeals = [...prev.meals];
            const newFood = {
                id: `food-${Date.now()}-${Math.random()}`,
                name: '', quantity: 0, unit: 'g',
                calories: 0, proteins: 0, carbs: 0, fats: 0
            };
            updatedMeals[mealIndex].foods.push(newFood);
            return { ...prev, meals: updatedMeals };
        });
    };

    const handleRemoveFood = (mealIndex, foodId) => {
        setFormData(prev => {
            const updatedMeals = [...prev.meals];
            updatedMeals[mealIndex].foods = updatedMeals[mealIndex].foods.filter(food => food.id !== foodId);
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
                <section className="form-section">
                    <h3>Informações do Plano</h3>
                    <div className="form-grid">
                        <div className="form-group"><label htmlFor="planTitle">Título do Plano</label><input type="text" id="planTitle" name="title" value={formData.title} onChange={handleInputChange} className={errors.title ? 'has-error' : ''} />{errors.title && <p className="error-message">{errors.title}</p>}</div>
                        <div className="form-group"><label>Paciente</label><input type="text" value={patient.name} disabled className="disabled-input" /></div>
                        <div className="form-group"><label htmlFor="startDate">Data de Início</label><input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} className={errors.startDate ? 'has-error' : ''} />{errors.startDate && <p className="error-message">{errors.startDate}</p>}</div>
                        <div className="form-group"><label htmlFor="endDate">Data de Término</label><input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} className={errors.endDate ? 'has-error' : ''} />{errors.endDate && <p className="error-message">{errors.endDate}</p>}</div>
                        <div className="form-group full-width"><label htmlFor="planSummary">Resumo do Plano</label><textarea id="planSummary" name="summary" rows="3" value={formData.summary} onChange={handleInputChange} placeholder="Breve resumo do objetivo do plano..."></textarea></div>
                        <div className="form-group"><label htmlFor="planStatus">Status</label><select id="planStatus" name="status" value={formData.status} onChange={handleInputChange}><option value="Rascunho">Rascunho</option><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option><option value="Concluído">Concluído</option></select></div>
                        <div className="form-group"><label htmlFor="planDuration">Duração</label><input type="text" id="planDuration" name="duration" value={formData.duration} disabled className="disabled-input" /></div>
                    </div>
                </section>

                <section className="form-section macro-calculation-section">
                    <h3>Cálculo de Macronutrientes</h3>
                    <div className="macro-inputs-grid">
                        {/* 1. Proteínas */}
                        <div className="form-group">
                            <label htmlFor="proteins">Proteínas (g)</label>
                            <input type="number" id="proteins" name="proteins" value={formData.proteins.toFixed(0)} onChange={handleMacroChange} />
                        </div>
                        {/* 2. Carboidratos */}
                        <div className="form-group">
                            <label htmlFor="carbs">Carboidratos (g)</label>
                            <input type="number" id="carbs" name="carbs" value={formData.carbs.toFixed(0)} onChange={handleMacroChange} />
                        </div>
                        {/* 3. Gorduras */}
                        <div className="form-group">
                            <label htmlFor="fats">Gorduras (g)</label>
                            <input type="number" id="fats" name="fats" value={formData.fats.toFixed(0)} onChange={handleMacroChange} />
                        </div>
                        {/* 4. Calorias (agora no final) */}
                        <div className="form-group">
                            <label htmlFor="totalCalories">Calorias</label>
                            <input type="number" id="totalCalories" name="totalCalories" value={formData.totalCalories.toFixed(0)} onChange={handleTotalCaloriesChange} />
                        </div>
                    </div>
                    <div className="macro-distribution">
                        <h4>Distribuição de Macronutrientes</h4>
                        <div className="distribution-content">
                            <div className="chart-container">{macroDistributionData.length > 0 && formData.totalCalories > 0 && (<ResponsiveContainer width="100%" height={200}><PieChart><Pie data={macroDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" labelLine={false}>{macroDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip formatter={(value, name) => [`${value.toFixed(0)} kcal`, name]} /></PieChart></ResponsiveContainer>)}</div>
                            <div className="distribution-list">{macroDistributionData.map((macro) => (<div key={macro.name} className="macro-item"><span className="macro-dot" style={{ backgroundColor: macro.color }}></span><p>{macro.name}</p><p><strong>{macro.grams.toFixed(0)}g</strong></p><span>{macro.percent}</span></div>))}</div>
                        </div>
                    </div>
                </section>

                <section className="form-section meals-section">
                    <h3>Refeições</h3>
                    <button type="button" onClick={handleAddMeal} className="add-meal-btn"><FaPlus /> Adicionar Refeição</button>
                    {formData.meals.map((meal, mealIndex) => {
                        const mealCalories = meal.foods.reduce((sum, food) => sum + parseFloat(food.calories || 0), 0);
                        const mealProteins = meal.foods.reduce((sum, food) => sum + parseFloat(food.proteins || 0), 0);
                        const mealCarbs = meal.foods.reduce((sum, food) => sum + parseFloat(food.carbs || 0), 0);
                        const mealFats = meal.foods.reduce((sum, food) => sum + parseFloat(food.fats || 0), 0);
                        return (
                            <div key={meal.id} className="meal-block">
                                <div className="meal-header"><input type="text" value={meal.name} onChange={(e) => handleMealChange(mealIndex, { name: e.target.value })} placeholder={`Refeição ${mealIndex + 1}`} className="meal-name-input" /><div className="meal-header-actions"><button type="button" onClick={() => handleRemoveMeal(meal.id)} className="remove-meal-btn" title="Remover Refeição"><FaTrashAlt /></button></div></div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '0.8rem', marginBottom: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' }}>
                                    <div><div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '4px' }}>Calorias (Plano)</div><div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#343a40' }}>{mealTotals.totalMealCalories.toFixed(0)}</div>{formatDifference(mealTotals.totalMealCalories, formData.totalCalories, ' kcal')}</div>
                                    <div><div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '4px' }}>Proteínas (Plano)</div><div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#343a40' }}>{mealTotals.totalMealProteins.toFixed(0)}g</div>{formatDifference(mealTotals.totalMealProteins, formData.proteins, 'g')}</div>
                                    <div><div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '4px' }}>Carboidratos (Plano)</div><div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#343a40' }}>{mealTotals.totalMealCarbs.toFixed(0)}g</div>{formatDifference(mealTotals.totalMealCarbs, formData.carbs, 'g')}</div>
                                    <div><div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '4px' }}>Gorduras (Plano)</div><div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#343a40' }}>{mealTotals.totalMealFats.toFixed(0)}g</div>{formatDifference(mealTotals.totalMealFats, formData.fats, 'g')}</div>
                                </div>
                                <div className="meal-totals-summary"><span>Calorias: <strong>{mealCalories.toFixed(0)} kcal</strong></span><span>Proteínas: <strong>{mealProteins.toFixed(1)}g</strong></span><span>Carboidratos: <strong>{mealCarbs.toFixed(1)}g</strong></span><span>Gorduras: <strong>{mealFats.toFixed(1)}g</strong></span></div>
                                <div className="food-table-wrapper">
                                    <div className="food-table-header"><span>ALIMENTO</span><span>QTD</span><span>UNIDADE</span><span>CALORIAS</span><span>P (G)</span><span>C (G)</span><span>G (G)</span><span></span></div>
                                    {meal.foods.map((food, foodIndex) => (
                                        <div key={food.id} className="food-item-row-wrapper">
                                            <div className="food-item-row">
                                                <input type="text" value={food.name} onChange={(e) => handleFoodChange(mealIndex, foodIndex, { name: e.target.value })} onFocus={() => setActiveSearchIndex({ mealIndex, foodIndex })} onBlur={() => setTimeout(() => setActiveSearchIndex(null), 200)} placeholder="Nome do alimento" />
                                                <input type="number" value={food.quantity} onChange={(e) => handleFoodChange(mealIndex, foodIndex, { quantity: e.target.value })} />
                                                <select value={food.unit} onChange={(e) => handleFoodChange(mealIndex, foodIndex, { unit: e.target.value })}><option>g</option><option>ml</option><option>un</option></select>
                                                <input type="number" readOnly value={food.calories.toFixed(2)} /><input type="number" readOnly value={food.proteins.toFixed(2)} /><input type="number" readOnly value={food.carbs.toFixed(2)} /><input type="number" readOnly value={food.fats.toFixed(2)} />
                                                <button type="button" onClick={() => handleRemoveFood(mealIndex, food.id)} className="remove-food-btn" title="Remover Alimento"><FaTrashAlt /></button>
                                            </div>
                                            {activeSearchIndex?.mealIndex === mealIndex && activeSearchIndex?.foodIndex === foodIndex && searchResults.length > 0 && (<div className="food-search-results">{searchResults.map((result) => (<div key={result.id} className="search-result-item" onMouseDown={() => handleFoodSelect(mealIndex, foodIndex, result)}>{result.name}</div>))}</div>)}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddFood(mealIndex)} className="add-food-btn"><FaPlus /> Adicionar Alimento</button>
                                </div>
                            </div>
                        );
                    })}
                </section>

                <section className="form-section">
                    <h3>Observações</h3>
                    <textarea name="observations" rows="4" value={formData.observations} onChange={handleInputChange} placeholder="Adicione observações sobre o plano alimentar..."></textarea>
                </section>

                <div className="form-actions">
                    <button type="button" onClick={onRequestClose} className="btn-cancel" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Plano'}</button>
                </div>
            </form>
        </Modal>
    );
}