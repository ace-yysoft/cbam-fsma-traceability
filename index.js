// 배출계수 데이터
const emissionFactors = {
    // 원재료 배출계수 (kg CO2e/톤)
    rawMaterials: {
        grain: 1500,
        vegetable: 2000,
        fruit: 1800,
        meat: 12000
    },
    // 포장재 배출계수 (kg CO2e/톤)
    packaging: {
        plastic: 6000,
        paper: 3000,
        glass: 4000,
        metal: 8000
    },
    // 운송 배출계수 (kg CO2e/톤-km)
    transport: {
        road: 0.2,
        rail: 0.05,
        sea: 0.01,
        air: 1.5
    },
    // 전기 배출계수 (kg CO2e/kWh)
    electricity: {
        grid: 0.4,
        renewable: 0.01
    },
    // 폐기물 배출계수 (kg CO2e/톤)
    waste: {
        landfill: 1000,
        recycle: 200,
        incineration: 500
    },
    // 저장 배출계수 (kg CO2e/톤-일)
    storage: {
        ambient: 0.1,
        chilled: 2.5,
        frozen: 5.0
    }
};

function calculateCBAMFootprint() {
    // 입력값 가져오기
    const rawMaterialsAmount = parseFloat(document.getElementById('rawMaterials').value) || 0;
    const rawMaterialType = document.getElementById('rawMaterialType').value;
    const packagingAmount = parseFloat(document.getElementById('packaging').value) || 0;
    const packagingType = document.getElementById('packagingType').value;
    const upstreamTransportDistance = parseFloat(document.getElementById('upstreamTransport').value) || 0;
    const transportType = document.getElementById('transportType').value;
    const electricity = parseFloat(document.getElementById('electricity').value) || 0;
    const electricitySource = document.getElementById('electricitySource').value;
    const water = parseFloat(document.getElementById('water').value) || 0;
    const waste = parseFloat(document.getElementById('waste').value) || 0;
    const wasteType = document.getElementById('wasteType').value;
    const distribution = parseFloat(document.getElementById('distribution').value) || 0;
    const distributionType = document.getElementById('distributionType').value;
    const storage = parseFloat(document.getElementById('storage').value) || 0;
    const storageType = document.getElementById('storageType').value;

    // 배출량 계산
    const rawMaterialsEmission = rawMaterialsAmount * emissionFactors.rawMaterials[rawMaterialType];
    const packagingEmission = packagingAmount * emissionFactors.packaging[packagingType];
    const upstreamTransportEmission = upstreamTransportDistance * emissionFactors.transport[transportType] * rawMaterialsAmount;
    const electricityEmission = electricity * emissionFactors.electricity[electricitySource];
    const waterEmission = water * 0.3; // 용수 배출계수: 0.3 kg CO2e/톤
    const wasteEmission = waste * emissionFactors.waste[wasteType];
    const distributionEmission = distribution * emissionFactors.transport[transportType] * (rawMaterialsAmount + packagingAmount);
    const storageEmission = storage * emissionFactors.storage[storageType] * rawMaterialsAmount;

    // 총 배출량 계산
    const totalEmissions = {
        upstream: rawMaterialsEmission + packagingEmission + upstreamTransportEmission,
        production: electricityEmission + waterEmission + wasteEmission,
        downstream: distributionEmission + storageEmission
    };

    const totalFootprint = Object.values(totalEmissions).reduce((a, b) => a + b, 0);

    // 결과 표시
    document.getElementById('footprint').textContent = 
        `${totalFootprint.toFixed(1)} kg CO₂e`;

    // 세부 내역 표시
    const breakdown = document.getElementById('breakdown');
    breakdown.innerHTML = `
        <h3>Scope 3 배출량 세부내역</h3>
        <p>상류 공급망 (Upstream): ${totalEmissions.upstream.toFixed(1)} kg CO₂e</p>
        <p>생산 공정 (Production): ${totalEmissions.production.toFixed(1)} kg CO₂e</p>
        <p>하류 공급망 (Downstream): ${totalEmissions.downstream.toFixed(1)} kg CO₂e</p>
        <h4>상세 분석</h4>
        <p>원재료 생산: ${rawMaterialsEmission.toFixed(1)} kg CO₂e</p>
        <p>포장재: ${packagingEmission.toFixed(1)} kg CO₂e</p>
        <p>원재료 운송: ${upstreamTransportEmission.toFixed(1)} kg CO₂e</p>
        <p>전기 사용: ${electricityEmission.toFixed(1)} kg CO₂e</p>
        <p>용수 사용: ${waterEmission.toFixed(1)} kg CO₂e</p>
        <p>폐기물 처리: ${wasteEmission.toFixed(1)} kg CO₂e</p>
        <p>제품 유통: ${distributionEmission.toFixed(1)} kg CO₂e</p>
        <p>저장/보관: ${storageEmission.toFixed(1)} kg CO₂e</p>
    `;

    // 차트 생성
    createChart(totalEmissions);
}

function createChart(emissions) {
    const ctx = document.getElementById('chart').getContext('2d');
    
    // 기존 차트가 있다면 제거
    if (window.emissionsChart) {
        window.emissionsChart.destroy();
    }

    window.emissionsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['상류 공급망', '생산 공정', '하류 공급망'],
            datasets: [{
                data: [
                    emissions.upstream,
                    emissions.production,
                    emissions.downstream
                ],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Scope 3 배출량 분포'
                }
            }
        }
    });
}

