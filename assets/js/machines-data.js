const initialMachines = [
        {
          id: "njp3500",
          equipoCod: "17333009",
          causaCod: "K7",
          causaDesc: "ENCAPSULADO SOLIDOS (130599) - NJP",
          name: "Encapsuladora automática NJP-3500",
          model: "NJP-3500",
          current: "Equipo actual",
          area: "Sede 4 · Encapsulado · Línea de cápsulas",
          location: "Sede 4 · Sólidos",
          status: "Operativo",
          criticality: "Alta",
          manual: "Manual OCR extraído y consolidado",
          maintenance: "Plan base extraído del manual",
          completion: 92,
          image: "njp3500.png",
          notes: "",
          searchAliases: ["encapsuladora", "llenadora", "capsulas", "capsula", "njp", "canaan", "kaixinlong", "polvo", "granulos", "pellets", "tamping", "dosificacion", "sólidos", "solidos","K7","130599","causa K7"],
          description:
            "Máquina automática para llenado de cápsulas duras con polvo, gránulos o pellets. El manual confirma arquitectura mecánica + eléctrica + neumática, proceso por estaciones y parámetros críticos de ajuste, limpieza, vacío, cierre y dosificación.",
          technicalData: {
            function: "Llenado automático de cápsulas duras con polvo, gránulos o pellets. Secuencia: alimentación, separación por vacío, dosificación, rechazo, cierre, descarga y limpieza.",
            capacity: "3.500 cápsulas/min · 210.000 cápsulas/h",
            capsuleSizes: "000# a 5# (25 alojamientos)",
            dosingSystem: "Dosificación cuantitativa por compactación (tamping)",
            manufacturer: "Zhejiang Canaan Kaixinlong Technology Co., Ltd.",
            brand: "Canaan / Kaixinlong",
            serialNumber: "260201",
            year: "202602",
            voltage: "380 V · 60 Hz (confirmado en placa)",
            power: "10.5 kW (manual) / 11.5 kW (ficha comercial)",
            weight: "2.200 kg",
            dimensions: "1555 × 1185 × 2040 mm (manual) / 1435(+550) × 1248(+280) × 1960 mm (ficha comercial)"
          },
          guideSections: [
            {
              id: "id-general",
              title: "Identificación general",
              content: `
                <div class="guide-media">
                  <div class="guide-media__img">
                    <img src="njp3500-main.png" alt="NJP-3500" />
                  </div>
                  <div class="guide-media__body">
                    <p><strong>Equipo:</strong> Llenadora automática de cápsulas duras</p>
                    <p><strong>Modelo operativo:</strong> NJP-3500</p>
                    <p><strong>Fabricante:</strong> Zhejiang Canaan Kaixinlong Technology Co., Ltd.</p>
                    <p><strong>Tipo:</strong> Llenadora automática rotativa intermitente</p>
                    <p><strong>Proceso:</strong> Orientación, separación, llenado, rechazo, cierre, descarga y limpieza de moldes</p>
                    <p><strong>Producto:</strong> Cápsulas duras con polvo, gránulo, pellets o microgránulos</p>
                    <p><strong>Área sugerida:</strong> Producción / Encapsulado · <strong>Criticidad:</strong> Alta</p>
                    <p><strong>Estado documental:</strong> Manual principal consolidado en esta ficha.</p>
                  </div>
                </div>
                <h4>Datos confirmados en placa <span class="src-tag src-manual">PLACA</span></h4>
                <div class="spec-grid">
                  <div class="spec-item"><span class="spec-item__label">Modelo</span><span class="spec-item__value">NJP-3500</span></div>
                  <div class="spec-item"><span class="spec-item__label">N° de serie</span><span class="spec-item__value">260201</span></div>
                  <div class="spec-item"><span class="spec-item__label">Voltaje</span><span class="spec-item__value">380 V · 60 Hz</span></div>
                  <div class="spec-item"><span class="spec-item__label">Eficiencia</span><span class="spec-item__value">3500 cáps/min</span></div>
                  <div class="spec-item"><span class="spec-item__label">Peso</span><span class="spec-item__value">2200 kg</span></div>
                  <div class="spec-item"><span class="spec-item__label">Fecha de fabricación</span><span class="spec-item__value">2026.02</span></div>
                  <div class="spec-item"><span class="spec-item__label">Fabricante</span><span class="spec-item__value">Ruian Kaixinlong Pharmaceutical Machinery Works, China</span></div>
                </div>
              `
            },
            {
              id: "parametros",
              title: "Parámetros técnicos confirmados",
              content: `
                <div class="guide-media">
                  <div class="guide-media__img">
                    <img src="assets/manual_es/manual-es-p12.jpg" alt="Parámetros técnicos" />
                  </div>
                  <div class="guide-media__body">
                    <p>Esta sección separa lo <strong>confirmado por manual</strong> de lo que proviene de <strong>ficha comercial</strong>. Cuando existan diferencias, la prioridad técnica para soporte debe ser el manual y luego la placa del equipo.</p>
                  </div>
                </div>
                <div class="spec-grid">
                  <div class="spec-item"><span class="spec-item__label">Capacidad</span><span class="spec-item__value">3.500 cápsulas/min</span></div>
                  <div class="spec-item"><span class="spec-item__label">Capacidad por hora</span><span class="spec-item__value">210.000 cápsulas/h</span></div>
                  <div class="spec-item"><span class="spec-item__label">Alojamientos</span><span class="spec-item__value">25</span></div>
                  <div class="spec-item"><span class="spec-item__label">Tamaños de cápsula</span><span class="spec-item__value">000# a 5#</span></div>
                  <div class="spec-item"><span class="spec-item__label">Potencia manual</span><span class="spec-item__value">10.5 kW</span></div>
                  <div class="spec-item"><span class="spec-item__label">Potencia ficha comercial</span><span class="spec-item__value">11.5 kW</span></div>
                  <div class="spec-item"><span class="spec-item__label">Peso</span><span class="spec-item__value">2.200 kg</span></div>
                  <div class="spec-item"><span class="spec-item__label">Dimensiones manual</span><span class="spec-item__value">1555 × 1185 × 2040 mm</span></div>
                  <div class="spec-item"><span class="spec-item__label">Dimensiones ficha comercial</span><span class="spec-item__value">1435(+550) × 1248(+280) × 1960 mm</span></div>
                  <div class="spec-item"><span class="spec-item__label">Temperatura ambiente</span><span class="spec-item__value">21 ± 3 °C</span></div>
                  <div class="spec-item"><span class="spec-item__label">Humedad relativa</span><span class="spec-item__value">45–50 %</span></div>
                  <div class="spec-item"><span class="spec-item__label">Altitud máxima</span><span class="spec-item__value">&lt; 1000 m</span></div>
                  <div class="spec-item"><span class="spec-item__label">Presión de aire (ficha)</span><span class="spec-item__value">0.4 – 0.7 MPa</span></div>
                  <div class="spec-item"><span class="spec-item__label">Vacío sistema (ficha)</span><span class="spec-item__value">-0.03 a -0.06 MPa</span></div>
                  <div class="spec-item"><span class="spec-item__label">Vacío operativo bomba SK</span><span class="spec-item__value">0.02–0.04 MPa</span></div>
                  <div class="spec-item"><span class="spec-item__label">Error de llenado (ficha)</span><span class="spec-item__value">±2.5% a ±5%</span></div>
                </div>
                <div class="alert-box">Diferencias detectadas: potencia, dimensiones y rango de cápsulas entre la ficha comercial previa y el manual. Validar finalmente contra la placa física.</div>
              `
            },
            {
              id: "diagrama-linea",
              title: "Diagrama de línea y equipos auxiliares",
              content: `
                <div class="guide-media" style="grid-template-columns:1fr">
                  <div class="guide-media__img">
                    <img src="assets/manual_es/manual-es-p18.jpg" alt="Diagrama de línea completa" />
                  </div>
                </div>
                <p>La máquina no trabaja sola. La línea completa está compuesta por:</p>
                <ol>
                  <li><strong>Contenedor de cápsulas terminadas</strong> — recepción de producto final</li>
                  <li><strong>Detector de metales</strong> — control de contaminación metálica</li>
                  <li><strong>Pulidora vertical de cápsulas</strong> — retiro de polvo superficial</li>
                  <li><strong>Máquina principal de llenado</strong> — NJP-3500</li>
                  <li><strong>Contenedor de material</strong> — almacenamiento de producto a dosificar</li>
                  <li><strong>Recolector de polvo</strong> — control de polvo en proceso</li>
                  <li><strong>Bomba de vacío</strong> — generación de vacío para separación tapa/cuerpo</li>
                </ol>
                <p>Además, hay dos <strong>transferencias</strong> clave:</p>
                <ul>
                  <li><strong>Transferencia de cápsulas vacías</strong> — desde el contenedor hasta la tolva</li>
                  <li><strong>Transferencia de polvo por vacío</strong> — desde el contenedor de material hasta dosificación</li>
                </ul>
                <p><strong>Opcionales del manual:</strong> alimentador automático de polvo, módulo de microgránulos, módulo de limpieza reforzada, cargador de cápsulas y pulidora.</p>
              `
            },
            {
              id: "instalacion-arranque",
              title: "Instalación y puesta en marcha",
              content: `
                <h4>Instalación</h4>
                <ul>
                  <li>Ubicar la máquina sobre base <strong>nivelada</strong> y sin oscilación.</li>
                  <li>Colocar <strong>caucho/goma antivibración</strong> bajo la base.</li>
                  <li>Instalar <strong>bomba de vacío</strong> y <strong>aspiradora</strong> preferiblemente separadas del cuerpo principal para reducir ruido.</li>
                  <li>Conectar líneas principales de vacío y aspiración.</li>
                  <li>Verificar que la alimentación eléctrica coincida con la requerida por el equipo.</li>
                </ul>
                <h4>Prueba inicial / commissioning</h4>
                <ol>
                  <li>Revisar tornillos, tuercas, pernos y fijaciones por aflojamientos de transporte.</li>
                  <li>Instalar el <strong>volante manual</strong> en el eje del motor principal.</li>
                  <li>Girar manualmente la estación <strong>3 a 5 vueltas</strong> y comprobar que no haya roce ni ruido anormal.</li>
                  <li>Hacer marcha en vacío durante <strong>1–2 horas</strong> antes de producción.</li>
                </ol>
              `
            },
            {
              id: "proceso-completo",
              title: "Descripción del proceso completo",
              content: `
                <p>Secuencia consolidada del manual:</p>
                <ol>
                  <li><strong>Alimentación y ordenamiento de cápsulas</strong></li>
                  <li><strong>Separación por vacío</strong> de tapa y cuerpo</li>
                  <li><strong>Dosificación y llenado</strong> del producto</li>
                  <li><strong>Rechazo</strong> de cápsulas defectuosas</li>
                  <li><strong>Cierre / bloqueo</strong> de cápsula</li>
                  <li><strong>Salida</strong> de cápsula terminada</li>
                  <li><strong>Limpieza del molde</strong></li>
                </ol>
                <p>En la práctica de planta puede desglosarse en 8–9 pasos, pero para soporte técnico esta versión resume mejor el flujo real descrito por el fabricante.</p>
              `
            },
            {
              id: "estacion-alimentacion",
              title: "Estación 1 – Alimentación de cápsulas vacías",
              content: `
                <div class="guide-media">
                  <div class="guide-media__img">
                    <img src="njp3500-main.png" alt="Estación de alimentación" />
                  </div>
                  <div class="guide-media__body">
                    <p>Las cápsulas vacías llegan desde la tolva o sistema de transferencia. En esta etapa vienen <strong>desordenadas</strong>: algunas con tapa arriba, otras inclinadas, otras atravesadas.</p>
                    <p>La máquina usa guías mecánicas para controlar la posición y convertir cápsulas desordenadas en cápsulas alineadas una por una.</p>
                    <p><strong>Ajustes críticos:</strong> la compuerta regula descarga; el retén debe dejar pasar una sola cápsula por ciclo; la acumulación recomendada es aprox. <strong>1/2 de la altura total de salida</strong>.</p>
                  </div>
                </div>
                <h4>¿Cómo logra que la tapa quede arriba?</h4>
                <p>La cápsula dura tiene dos partes: <strong>tapa</strong> (más corta y ancha) y <strong>cuerpo</strong> (más largo y estrecho). La máquina aprovecha diferencias de diámetro, longitud, guías con forma específica, canales estrechos, gravedad y empujadores mecánicos. El cuerpo, por ser más largo, queda dirigido hacia abajo.</p>
              `
            },
            {
              id: "estacion-molde",
              title: "Estación 2 – Colocación en el molde",
              content: `
                <p>La cápsula orientada entra al sistema de moldes. El <strong>molde superior</strong> sujeta la tapa y el <strong>molde inferior</strong> sujeta el cuerpo. Esto es fundamental porque la siguiente estación separa ambas partes.</p>
                <p><strong>Calibración crítica del manual:</strong> holgura entre módulos superior e inferior de <strong>0.2–0.3 mm</strong> y concentricidad de molde de <strong>0.01–0.02 mm</strong>.</p>
              `
            },
            {
              id: "estacion-vacio",
              title: "Estación 3 – Separación de tapa y cuerpo por vacío",
              content: `
                <p>La máquina aplica <strong>vacío desde la parte inferior</strong>. El vacío succiona el cuerpo hacia abajo mientras la tapa queda retenida en el molde superior.</p>
                <ul>
                  <li>Molde superior → retiene la tapa</li>
                  <li>Molde inferior → baja el cuerpo</li>
                  <li>Vacío → separa cuerpo y tapa</li>
                </ul>
                <p><strong>Holgura en reposo del asiento de succión:</strong> 1.8–2.5 mm.</p>
                <p><strong>Vacío de bomba SK:</strong> 0.02–0.04 MPa según el manual. <strong>Vacío nominal de sistema:</strong> -0.03 a -0.06 MPa según ficha comercial.</p>
                <p>Si el vacío es bajo: cápsulas que no se abren, parcialmente separadas, sin llenar, deformadas o paradas por rechazo.</p>
              `
            },
            {
              id: "estacion-llenado",
              title: "Estación 4 – Llenado del material",
              content: `
                <p>El material (polvo, gránulo, pellets, partículas, mini-pills) se dosifica mediante <strong>compactación cuantitativa</strong>.</p>
                <ol>
                  <li>El polvo entra a una cámara de dosificación</li>
                  <li>Un punzón presiona el polvo formando un tapón compactado</li>
                  <li>Ese volumen se transfiere al cuerpo de la cápsula</li>
                  <li>La cantidad depende del volumen, densidad aparente y ajuste de profundidad</li>
                </ol>
                <p><strong>Holguras críticas:</strong> disco dosificador vs copper pad <strong>0.05–0.15 mm</strong>; bloqueador de polvo vs disco <strong>0.05–0.1 mm</strong>.</p>
                <p><strong>Detector de nivel de polvo:</strong> tipo capacitivo; distancia recomendada al plano del disco dosificador <strong>18–28 mm</strong>.</p>
                <p><strong>Referencia de profundidad de punzones:</strong> estaciones 1 a 5 → 6 / 4 / 3 / 2 / 0.5.</p>
                <p><strong>Variables que afectan la dosis:</strong> fluidez, densidad, humedad, tamaño de partícula, velocidad de máquina, altura de dosificación, estado de punzones y limpieza del módulo.</p>
              `
            },
            {
              id: "estacion-rechazo",
              title: "Estación 5 – Rechazo de cápsulas defectuosas",
              content: `
                <p>Una <strong>varilla o sistema de rechazo</strong> expulsa cápsulas que no fueron correctamente abiertas, llenadas o posicionadas.</p>
                <p><strong>Cápsulas defectuosas:</strong> sin cuerpo separado, sin polvo, mal colocadas, deformadas, rotas o parcialmente cerradas.</p>
                <p><strong>Ajuste del manual (p39):</strong> holgura de <strong>1,5–2 mm</strong> entre el plano inferior de la cámara de vacío y el plano superior del <strong>módulo inferior</strong>, ajustable con la varilla de tracción del molde inferior. Es la única holgura que da el manual para esta estación.</p>
                <p>Si esta estación se ensucia, desajusta o pierde sincronía, puede rechazar cápsulas buenas o dejar pasar cápsulas malas.</p>
              `
            },
            {
              id: "estacion-cierre",
              title: "Estación 6 – Cierre de cápsula",
              content: `
                <p>El cuerpo lleno se alinea con la tapa y una <strong>varilla de cierre</strong> presiona una contra la otra.</p>
                <ol>
                  <li>La tapa está retenida arriba</li>
                  <li>El cuerpo lleno está abajo</li>
                  <li>El sistema empuja la tapa sobre el cuerpo</li>
                  <li>La cápsula queda cerrada y bloqueada</li>
                </ol>
                <p>El manual recomienda calibrar la altura final usando una cápsula no cerrada, llevándola a la estación de cierre y ajustando hasta obtener la <strong>longitud final real de cápsula cerrada</strong>.</p>
                <p><strong>Problemas comunes:</strong> cápsula abierta o aplastada, tapa quebrada, cierre incompleto, fuga de polvo. Causas: exceso de polvo, desalineación, mala calidad de cápsulas, altura incorrecta, suciedad y desgaste.</p>
              `
            },
            {
              id: "estacion-descarga",
              title: "Estación 7 – Descarga de producto terminado",
              content: `
                <p>Una <strong>varilla de expulsión</strong> empuja la cápsula cerrada hacia la salida. Luego pasa a:</p>
                <ul>
                  <li><strong>Pulidora vertical</strong> — retira polvo superficial</li>
                  <li><strong>Detector de metales</strong> — controla contaminación metálica</li>
                  <li><strong>Contenedor de producto terminado</strong></li>
                </ul>
                <p><strong>Ajuste del manual:</strong> el extremo del perno de descarga debe quedar 1–2 mm por encima del plano del molde superior; en retorno debe conservar 1.5–2 mm de holgura para evitar golpe.</p>
              `
            },
            {
              id: "estacion-limpieza",
              title: "Estación 8 – Limpieza del molde",
              content: `
                <p>Una <strong>aguja de aire</strong> limpia el alojamiento del molde. Si no limpia bien, pueden aparecer: cápsulas mal asentadas, falsa separación, cierre defectuoso, contaminación cruzada, variación de peso y atascos.</p>
                <p>El manual destaca que la torreta fue diseñada como conjunto sellado y que la <strong>limpieza del molde normalmente no requiere desmontar la torreta</strong>.</p>
              `
            },
            {
              id: "mandos-hmi",
              title: "Pantalla y mandos visibles",
              content: `
                <p>Botones identificados en la HMI del manual:</p>
                <ul>
                  <li><strong>Jogging of the host</strong> — punto a punto de la máquina principal</li>
                  <li><strong>Host fan jog</strong> — punto a punto del ventilador / sistema asociado</li>
                  <li><strong>Hopper Up / Hopper descent</strong> — subir / bajar tolva</li>
                  <li><strong>Open the capsule / Capsule close</strong> — apertura / cierre</li>
                  <li><strong>Capsule on</strong> — carga o presencia de cápsulas</li>
                  <li><strong>Stop</strong> — parada</li>
                </ul>
                <p>El sistema de control usa <strong>pantalla táctil Siemens</strong>, <strong>PLC Siemens</strong> y variador <strong>Emerson EV1000</strong>.</p>
              `
            },
            {
              id: "sistemas-principales",
              title: "Sistemas principales",
              content: `
                <table class="crit-table">
                  <tr><th>Sistema</th><th>Función</th><th>Criticidad</th></tr>
                  <tr><td>Alimentación de cápsulas</td><td>Recibir y ordenar cápsulas vacías</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Orientación</td><td>Colocar tapa arriba y cuerpo abajo</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Moldes</td><td>Sujetar tapa y cuerpo durante el ciclo</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Vacío</td><td>Separar tapa y cuerpo</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Dosificación</td><td>Medir y cargar material</td><td class="crit-vhigh">Muy alta</td></tr>
                  <tr><td>Rechazo</td><td>Retirar cápsulas defectuosas</td><td class="crit-med">Media-alta</td></tr>
                  <tr><td>Cierre</td><td>Ensamblar tapa y cuerpo</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Expulsión</td><td>Sacar cápsula terminada</td><td>Media</td></tr>
                  <tr><td>Limpieza de molde</td><td>Retirar polvo residual</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Transmisión</td><td>Sincronizar torreta y estaciones</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Colector de polvo</td><td>Controlar polvo en proceso</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Control eléctrico</td><td>HMI, sensores, PLC, variadores</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Seguridad</td><td>Guardas, puertas, paros</td><td class="crit-high">Alta</td></tr>
                </table>
              `
            },
            {
              id: "variables-criticas",
              title: "Variables críticas de operación",
              content: `
                <ul>
                  <li><strong>Vacío de sistema:</strong> -0.03 a -0.06 MPa (ficha)</li>
                  <li><strong>Vacío bomba SK:</strong> 0.02–0.04 MPa (manual)</li>
                  <li><strong>Presión de aire:</strong> 0.4 – 0.7 MPa</li>
                  <li><strong>Velocidad:</strong> hasta 3.500 cáps/min</li>
                  <li><strong>Error de llenado:</strong> ±2.5% a ±5%</li>
                  <li><strong>Holgura asiento de succión:</strong> 1.8–2.5 mm</li>
                  <li><strong>Holgura módulos sup/inf:</strong> 0.2–0.3 mm</li>
                  <li><strong>Concentricidad de molde:</strong> 0.01–0.02 mm</li>
                  <li><strong>Holgura disco dosificador:</strong> 0.05–0.15 mm</li>
                  <li><strong>Holgura bloqueador de polvo:</strong> 0.05–0.1 mm</li>
                  <li><strong>Detector de nivel:</strong> 18–28 mm</li>
                  <li><strong>Altura / profundidad de dosificación:</strong> determina el peso de llenado</li>
                  <li><strong>Humedad y fluidez del polvo</strong></li>
                  <li><strong>Estado de punzones y disco dosificador</strong></li>
                </ul>
              `
            },
            {
              id: "mantenimiento-limpieza",
              title: "Limpieza y mantenimiento preventivo",
              content: `
                <h4>Limpieza básica</h4>
                <ul>
                  <li>Limpiar internamente <strong>solo con aspiradora</strong>.</li>
                  <li>Retirar residuos de producto y material.</li>
                  <li>Limpiar sensores con <strong>paño suave sin pelusa</strong>.</li>
                </ul>
                <h4>Reglas generales</h4>
                <ul>
                  <li>No intervenir con energía aplicada.</li>
                  <li>Liberar presión antes de intervenir sistemas presurizados.</li>
                  <li>Esperar enfriamiento de partes calientes.</li>
                  <li>Señalizar el área de trabajo.</li>
                  <li>Cualquier anomalía detectada debe corregirse antes de volver a producir.</li>
                </ul>
              `
            },
            {
              id: "repuestos-criticos",
              title: "Repuestos críticos y de desgaste",
              content: `
                <table class="crit-table">
                  <tr><th>Repuesto</th><th>Sistema</th><th>Tipo</th><th>Criticidad</th></tr>
                  <tr><td>Filtro de vacío</td><td>Vacío</td><td>Consumible</td><td class="crit-vhigh">Muy alta</td></tr>
                  <tr><td>Manguera de vacío</td><td>Vacío</td><td>Neumático</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Punzones de dosificación</td><td>Dosificación</td><td>Desgaste</td><td class="crit-vhigh">Muy alta</td></tr>
                  <tr><td>Disco dosificador</td><td>Dosificación</td><td>Mecánico</td><td class="crit-vhigh">Muy alta</td></tr>
                  <tr><td>Copper pad / anillo de cobre</td><td>Dosificación</td><td>Mecánico</td><td class="crit-vhigh">Muy alta</td></tr>
                  <tr><td>Aguja de limpieza</td><td>Limpieza</td><td>Consumible</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Moldes superior e inferior</td><td>Moldes</td><td>Mecánico</td><td class="crit-vhigh">Muy alta</td></tr>
                  <tr><td>Junta / sello de vacío</td><td>Vacío</td><td>Sello</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Correas, cadena y rodamientos</td><td>Transmisión</td><td>Mecánico</td><td class="crit-high">Alta</td></tr>
                  <tr><td>Barras de calibración</td><td>Moldes</td><td>Herramental</td><td class="crit-high">Alta</td></tr>
                </table>
                <p>El manual también lista rodamientos por zonas de estación, alimentación, columna de llenado y transmisión; ver la sección de repuestos abajo.</p>
              `
            },
            {
              id: "mantenimiento",
              title: "Mantenimiento preventivo",
              content: `
                <table class="crit-table">
                  <tr><th>Tarea</th><th>Sistema</th><th>Frecuencia</th><th>Tipo</th></tr>
                  <tr><td>Limpieza e inspección de filtros de vacío</td><td>Vacío</td><td>Semanal</td><td>Preventivo</td></tr>
                  <tr><td>Inspección visual general</td><td>General</td><td>Diario</td><td>Rutina</td></tr>
                  <tr><td>Verificación de nivel de vacío</td><td>Vacío</td><td>Diario</td><td>Rutina</td></tr>
                  <tr><td>Limpieza de aguja de molde</td><td>Limpieza</td><td>Diario</td><td>Rutina</td></tr>
                  <tr><td>Limpieza de sensores</td><td>Control</td><td>Diario</td><td>Rutina</td></tr>
                  <tr><td>Lubricación de punzones / módulos</td><td>Dosificación</td><td>Semanal</td><td>Preventivo</td></tr>
                  <tr><td>Revisión de mangueras y racores</td><td>Neumática</td><td>Mensual</td><td>Preventivo</td></tr>
                  <tr><td>Calibración de peso de llenado</td><td>Dosificación</td><td>Según lote</td><td>Control calidad</td></tr>
                  <tr><td>Limpieza general de moldes</td><td>Moldes</td><td>Semanal</td><td>Preventivo</td></tr>
                  <tr><td>Revisión de sistema de rechazo</td><td>Rechazo</td><td>Mensual</td><td>Preventivo</td></tr>
                  <tr><td>Inspección de interruptores de puerta</td><td>Seguridad</td><td>Mensual</td><td>Preventivo</td></tr>
                  <tr><td>Inspección de filtros / ductos de aspiración</td><td>Colector de polvo</td><td>Semanal</td><td>Preventivo</td></tr>
                  <tr><td>Revisión de cadena / tensión</td><td>Transmisión</td><td>Mensual</td><td>Preventivo</td></tr>
                </table>
              `
            },
            {
              id: "lubricacion",
              title: "Lubricación y consumibles técnicos",
              content: `
                <table class="crit-table">
                  <tr><th>Punto</th><th>Producto / referencia</th><th>Nota</th></tr>
                  <tr><td>Cadena</td><td>N4B GB443-84</td><td>Tabla de lubricación del manual</td></tr>
                  <tr><td>Rodamientos / guías</td><td>N4B GB443-84</td><td>Tabla del manual</td></tr>
                  <tr><td>Levas</td><td>ZL2SY1412-75</td><td>Tabla del manual</td></tr>
                  <tr><td>Caja eléctrica / reductor</td><td>ZLDSY1412-75</td><td>Tabla del manual</td></tr>
                  <tr><td>Levas / estaciones varias</td><td>STABYL 300 AL2</td><td>Texto OCR del plan de mantenimiento</td></tr>
                  <tr><td>Guías / empujadores direccionales</td><td>Fuchs GERALYN</td><td>1–2 disparos</td></tr>
                </table>
              `
            },
            {
              id: "fallas-comunes",
              title: "Fallas comunes y diagnóstico",
              content: `
                <table class="crit-table">
                  <tr><th>Falla</th><th>Sistema probable</th><th>Síntomas</th><th>Verificaciones</th></tr>
                  <tr><td>Cápsulas no se separan</td><td>Vacío / Alimentación</td><td>Cápsulas sin abrir, paradas</td><td>Vacío, asiento de succión 1.8–2.5 mm, filtros, mangueras, agua bomba SK</td></tr>
                  <tr><td>Variación de peso</td><td>Dosificación</td><td>Peso fuera de rango</td><td>Disco 0.05–0.15 mm, bloqueador 0.05–0.1 mm, detector 18–28 mm, punzones, fluidez/humedad</td></tr>
                  <tr><td>Cápsulas rotas o roce</td><td>Cierre / Moldes</td><td>Dañadas, ruido, marcas</td><td>Alineación, concentricidad 0.01–0.02 mm, altura de cierre, calidad de cápsulas</td></tr>
                  <tr><td>Rechazo excesivo</td><td>Rechazo / Vacío</td><td>Muchas al descarte</td><td>Sincronía, holgura 1,5–2 mm (cámara de vacío vs módulo inferior), vacío, posicionamiento</td></tr>
                  <tr><td>Atascos en molde</td><td>Limpieza / Moldes</td><td>Paradas por atasco</td><td>Aguja limpieza, polvo acumulado, desgaste, limpieza de torreta</td></tr>
                  <tr><td>Ruido anormal en aspiración</td><td>Colector de polvo</td><td>Sonido raro, baja extracción</td><td>Filtro y tubería de aspiración obstruidos</td></tr>
                </table>
              `
            },
            {
              id: "cambio-formato",
              title: "Cambio de moldes, módulos y formato",
              content: `
                <ul>
                  <li><strong>Moldes sup/inf:</strong> desmontar asientos, retirar moldes, cambiar sello y recalibrar.</li>
                  <li><strong>Concentricidad requerida:</strong> 0.01–0.02 mm usando las 2 barras de calibración del herramental.</li>
                  <li><strong>Verificación posterior:</strong> girar manualmente 3–5 vueltas sin ruido ni roce.</li>
                  <li><strong>Módulo de llenado:</strong> retirar verticalmente, respetando numeración de soporte y placa de posicionamiento.</li>
                  <li><strong>Disco dosificador:</strong> reinstalar y centrar fila por fila con los punzones, sin roce.</li>
                  <li><strong>Sistema de alimentación de cápsulas:</strong> no intercambiar conjunto izquierdo y derecho; el manual indica diferente número de alojamientos/orificios.</li>
                  <li><strong>Microgránulos:</strong> el manual contempla reemplazar el sistema de polvo por un módulo de microgránulos.</li>
                </ul>
              `
            },
            {
              id: "seguridad",
              title: "Seguridad, interlocks y advertencias",
              content: `
                <ul>
                  <li>Solo personal entrenado debe ajustar, mantener o reparar.</li>
                  <li>La máquina debe operar con <strong>todas las guardas instaladas</strong>.</li>
                  <li>Si una protección se abre en zona de trabajo, la máquina debe <strong>detenerse automáticamente</strong>.</li>
                  <li>Incluye <strong>paro de emergencia</strong>.</li>
                  <li>No lavar el gabinete eléctrico con agua ni con equipos de alta presión.</li>
                  <li>En caso de incendio accidental, usar <strong>extintor CO2</strong>.</li>
                  <li>Con polvos finos o tóxicos hay riesgo de <strong>toxicidad</strong> y <strong>explosión de polvo</strong>.</li>
                  <li>El usuario debe validar que el sistema de filtración sea apto para el producto procesado.</li>
                </ul>
              `
            },
            {
              id: "electrico",
              title: "Componentes eléctricos principales",
              content: `
                <table class="crit-table">
                  <tr><th>Componente</th><th>Modelo / serie</th><th>Observación</th></tr>
                  <tr><td>Pantalla táctil</td><td>Siemens SMART1000IE V3.10</td><td>HMI principal</td></tr>
                  <tr><td>PLC</td><td>Siemens CPU222</td><td>Control principal</td></tr>
                  <tr><td>Módulo de expansión</td><td>EM232</td><td>Expansión de señales</td></tr>
                  <tr><td>Fuente switching</td><td>24VDC 35W S-35-24</td><td>OCR sugiere Mean Well / Mingwei</td></tr>
                  <tr><td>Contactores AC</td><td>Siemens 3TB41 / 3TB43</td><td>Tablero</td></tr>
                  <tr><td>Relés intermedios</td><td>Omron MY4NJ</td><td>Tablero</td></tr>
                  <tr><td>Variador</td><td>Emerson EV1000</td><td>Velocidad principal</td></tr>
                  <tr><td>Motor principal</td><td>SEW R57DRS112M4/2W</td><td>Transmisión</td></tr>
                  <tr><td>Bomba de vacío</td><td>Serie SK</td><td>Separación por vacío</td></tr>
                  <tr><td>Detector de nivel</td><td>Omron E2K-C25ME1</td><td>Nivel de polvo</td></tr>
                </table>
              `
            },
            {
              id: "rodamientos",
              title: "Rodamientos y referencias de repuesto",
              content: `
                <table class="crit-table">
                  <tr><th>Zona</th><th>Referencia</th><th>Cantidad</th></tr>
                  <tr><td>Estaciones</td><td>Linear rolling bearing zxl 16 26 36</td><td>96</td></tr>
                  <tr><td>Estaciones</td><td>6302</td><td>12</td></tr>
                  <tr><td>Estaciones</td><td>CF-6</td><td>12</td></tr>
                  <tr><td>Alimentación de cápsulas</td><td>zxl 16 26 36 / zxl 12 22 32</td><td>8 / 8</td></tr>
                  <tr><td>Alimentación de cápsulas</td><td>625 / 626 / 608 / 6004</td><td>2 / 2 / 4 / 4</td></tr>
                  <tr><td>Columna de llenado</td><td>zxl 50 80 100</td><td>4</td></tr>
                  <tr><td>Transmisión</td><td>zxt 25 40 58 / zxt 12 22 32</td><td>16 / 3</td></tr>
                  <tr><td>Transmisión</td><td>1309 / 1507 / CF-18 / 62200-2RS / NA4905 / NA4906</td><td>2 / OCR parcial / 7 / 8 / 10 / 2</td></tr>
                </table>
                <p>Algunas cantidades menores quedaron parciales por OCR; si vas a comprar repuestos, conviene validar la lista contra desmontaje físico o plano.</p>
              `
            },
            {
              id: "pendientes",
              title: "Datos pendientes por confirmar",
              content: `
                <p>Estos son los <strong>vacíos reales del manual</strong>: cosas que el manual NO especifica y que conviene validar en planta antes de depender de ellas. Pensado para que no te confíes de un dato que no existe.</p>
                <h4>Vacíos detectados en el manual en español</h4>
                <ul>
                  <li><strong>Presión del aire comprimido:</strong> el manual no da el valor (MPa/bar) ni el consumo neumático → medir el suministro real en planta.</li>
                  <li><strong>Aceite del reductor:</strong> solo dice “según el fabricante del lubricante”; falta tipo, viscosidad y volumen → conseguir la ficha del reductor SEW.</li>
                  <li><strong>Acometida eléctrica:</strong> tensión confirmada en placa (<strong>380 V · 60 Hz</strong>); falta confirmar corriente/amperaje en el armario (esquema p74–75 poco legible).</li>
                  <li><strong>Códigos de alarma del PLC/HMI:</strong> no hay tabla de fallas codificadas → pedir el listado de alarmas al fabricante.</li>
                  <li><strong>Rodamientos “zxl/zxt”:</strong> es nomenclatura interna del fabricante → conseguir la equivalencia comercial estándar para comprarlos.</li>
                  <li><strong>Pares de apriete (torque):</strong> no se detallan para la tornillería (M3, M5, M6, M8, M12, M16) → definir tabla de torques.</li>
                  <li><strong>Limpieza/validación sanitaria (GMP):</strong> faltan protocolos de limpieza entre lotes y cambio de producto → definir con calidad.</li>
                  <li><strong>Agua de la bomba de vacío SK:</strong> no se indica caudal ni calidad/temperatura del agua → validar con la ficha de la bomba (Zhejiang Xinhuan).</li>
                  <li><strong>Errata de levas (p42):</strong> el manual rotula dos como “Leva 4” → confirmar la numeración real de las 6 levas.</li>
                </ul>
                <h4>Confirmar contra el equipo físico</h4>
                <ul>
                  <li><strong>Placa:</strong> ✓ confirmada — NJP-3500, serie 260201, 380 V · 60 Hz, 2200 kg, fab. 2026.02 (ver “Identificación general”).</li>
                  <li><strong>Potencia:</strong> 10,5 kW (manual) vs ficha comercial → confirmar amperaje en el armario.</li>
                  <li><strong>Herramental instalado:</strong> tallas de moldes y punzones realmente montados.</li>
                  <li><strong>Plano eléctrico y neumático</strong> legibles y <strong>lista de repuestos con códigos comerciales</strong>.</li>
                </ul>
                <div class="alert-box">Nota: las páginas 76–78 del manual son <strong>certificados de inspección del material</strong> (acero), no información operativa. La ficha ya sirve para soporte y consulta; cierra estos puntos antes de operación rutinaria.</div>
              `
            },
            {
              id: "como-funciona",
              title: "¿Cómo funciona? — qué hace y cómo lo hace",
              content: `
                <p style="font-size:1.02rem"><strong>En una frase:</strong> la NJP-3500 toma cápsulas duras vacías, las abre, les mete una dosis exacta de polvo (o micropellets), las vuelve a cerrar y las expulsa terminadas — hasta <strong>3.500 cápsulas por minuto</strong>.</p>
                <p>Lo hace en una <strong>mesa giratoria (torreta)</strong> con segmentos de <strong>25 orificios</strong> que avanzan paso a paso por varias estaciones. En cada parada se hace una operación distinta, y todo se sincroniza con un <strong>juego de 6 levas</strong>, accionado por un motor principal SEW con variador Emerson y un PLC Siemens con pantalla táctil. El vacío (bomba de anillo de agua serie SK) y la aspiración de polvo (colector EDC) van aparte para hacer menos ruido.</p>
                <div class="alert-box" style="background:#eef4ff;border-color:#cdddff">Idea clave para entenderla: <strong>los 8 pasos de abajo ocurren al mismo tiempo</strong>, cada uno en una estación distinta de la torreta. Una cápsula entra por el paso 1 y, vuelta a vuelta, va pasando por todos los pasos hasta salir terminada.</div>

                <h4>El proceso en 8 pasos</h4>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Ordenamiento y alimentación de cápsulas vacías</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Guarda las cápsulas vacías y las entrega <strong>de una en una</strong> a la torreta.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>Las cápsulas se cargan en la tolva y bajan por una compuerta regulable (la altura de cápsulas en la salida debe ser ≈ la mitad de la altura total de salida). Caen por el tubo de alimentación; unas uñas de retención con muelle dejan pasar <strong>una sola cápsula por ciclo</strong> y un empujador vertical controla el avance.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Tolva con compuerta y tapa transparente, tuerca de ajuste, tubo de alimentación, uñas de retención, muelle, marco soporte, empujador vertical.</span></div>
                  <div class="step-card__row"><span>Eléctrica</span><span>Movimiento accionado por el motor principal a través de la transmisión por cadena.</span></div>
                  <div class="step-card__params"><strong>Ajuste clave:</strong> altura de cápsulas ≈ ½ de la altura de salida · una cápsula por ciclo.</div>
                </div>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Dispensación y corrección de orientación</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Reparte las cápsulas y <strong>voltea las que vienen al revés</strong> para que todas queden igual.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>El tubo dispensador hace movimientos de ida y vuelta (alimenta, almacena, invierte, dispensa y empuja). Un empujador clasifica cada cápsula según dónde la toca, definiendo su orientación.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Conjunto de tubo dispensador (cara A), peine de cápsulas (cara B), varilla de ajuste de dos puntas, bloque y empujador de clasificación.</span></div>
                  <div class="step-card__row"><span>Eléctrica</span><span>Movimiento alternativo accionado por el motor / las levas.</span></div>
                  <div class="step-card__params"><strong>Ajuste clave:</strong> distancia entre la cara A (tubo) y la cara B (peine) = <strong>2–3 mm</strong>, con la varilla roscada de dos puntas.</div>
                </div>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">Apertura de la cápsula por vacío</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Separa la cápsula en sus dos mitades (<strong>cuerpo y tapa</strong>) succionando con vacío.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>El asiento de succión, empujado por un muelle, succiona la cápsula. En reposo hay una holgura entre el asiento y el molde; en marcha hacen contacto total y la cápsula entra al asiento. El vacío lo genera la bomba de anillo de agua serie SK.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Molde superior e inferior, asiento de succión, muelle de compresión, varilla de ajuste, balancín.</span></div>
                  <div class="step-card__row"><span>Eléctrica / vacío</span><span>Bomba de vacío SK; nivel leído en manómetro; válvula de entrada de agua para regularlo.</span></div>
                  <div class="step-card__params"><strong>Ajustes clave:</strong> holgura asiento de succión–molde en reposo <strong>1,8–2,5 mm</strong> · vacío de trabajo <strong>0,02–0,04 MPa</strong> (ni más ni menos, o las cápsulas no se abren o se dañan).</div>
                </div>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Dosificación y llenado del polvo</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Mide la dosis de polvo y la <strong>compacta dentro del cuerpo</strong> de la cápsula.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>El polvo cae a la tolva; un mezclador giratorio y un tornillo transportador lo reparten en la posición de llenado. Las varillas de llenado (punzones) entran en el disco dosificador a profundidades distintas por estación: <strong>a mayor profundidad, más dosis</strong>. Un detector capacitivo vigila el nivel de polvo.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Tolva de polvo, mezclador, tornillo transportador, reductor, disco dosificador, módulo y varillas de llenado, almohadilla de cobre, bloque de bloqueo de polvo, raspador, anillo de almacenaje.</span></div>
                  <div class="step-card__row"><span>Eléctrica</span><span>Motorreductor del mezclador y tornillo; detector capacitivo de nivel (soporte M6, altura 18–28 mm).</span></div>
                  <div class="step-card__params"><strong>Ajustes clave:</strong> profundidad de punzón por estación <strong>6 / 4 / 3 / 2 / 0,5 mm</strong> (Est. 1–5) · disco–almohadilla de cobre <strong>0,05–0,15 mm</strong> · raspador de polvo <strong>0,05–0,1 mm</strong> · detector de nivel <strong>18–28 mm</strong>.</div>
                </div>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Rechazo de cápsulas no abiertas o defectuosas</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Aparta y desecha las cápsulas que no se separaron o salieron mal.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>La cámara de vacío aspira esas cápsulas hacia la caja de desecho. Se ajusta la varilla de tracción del molde inferior para fijar la separación con la cámara de vacío.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Cámara de vacío, manija, poste guía, pasador eyector, varilla de tracción, módulos superior e inferior.</span></div>
                  <div class="step-card__row"><span>Eléctrica / vacío</span><span>Asistido por la bomba de vacío SK.</span></div>
                  <div class="step-card__params"><strong>Ajuste clave:</strong> separación entre el plano inferior de la cámara de vacío y el plano superior del módulo inferior <strong>1,5–2 mm</strong>.</div>
                </div>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">Cierre de la cápsula</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Une la tapa con el cuerpo lleno hasta la <strong>longitud correcta</strong> de cápsula cerrada.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>Se gira la palanca para subir el pasador eyector; la distancia desde la placa superior debe ser igual a la longitud de la cápsula ya cerrada. Para calibrar, se coloca una cápsula abierta en el orificio frontal, se gira hasta el bloqueo, se mide y se aprietan tornillos y tuercas. Lo sincroniza la <strong>Leva 5 (Cierre)</strong>.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Palanca, pasador eyector, módulos sup/inf, deflector superior, junta universal, poste guía, barra inferior.</span></div>
                  <div class="step-card__row"><span>Eléctrica</span><span>No aplica: es movimiento mecánico por levas.</span></div>
                  <div class="step-card__params"><strong>Ajuste clave:</strong> distancia desde la placa superior = longitud de la cápsula cerrada.</div>
                </div>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">Expulsión y salida del producto terminado</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Saca la cápsula terminada del molde <strong>sin que choque</strong>.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>Se gira la palanca elevando el extremo del pasador eyector por encima del plano del molde; en el retorno se mantiene una holgura para evitar golpes. La <strong>Leva 4 (Descargas)</strong> gestiona la salida.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Palanca, pasador eyector, módulos, deflector superior, junta universal, conjunto de descarga.</span></div>
                  <div class="step-card__row"><span>Eléctrica / vacío</span><span>Asistencia por vacío para separar la cápsula.</span></div>
                  <div class="step-card__params"><strong>Ajustes clave:</strong> pasador eyector <strong>1–2 mm</strong> sobre el plano superior del molde · <strong>1,5–2 mm</strong> de holgura en el retorno.</div>
                </div>

                <div class="step-card">
                  <div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">Limpieza del polvo residual</span></div>
                  <div class="step-card__row"><span>Qué hace</span><span>Limpia el polvo sobrante de las estaciones antes de reiniciar el ciclo.</span></div>
                  <div class="step-card__row"><span>Cómo lo hace</span><span>La aspiradora industrial / colector de polvo (EDC) succiona el polvo y las cápsulas de desecho por una malla de filtro y un tubo hacia un contenedor.</span></div>
                  <div class="step-card__row"><span>Mecánica</span><span>Conjunto de limpieza, filtro insonorizado, malla, tubo de succión, cubo de almacenamiento, botón de limpieza.</span></div>
                  <div class="step-card__row"><span>Eléctrica</span><span>Ventilador de aspiración (aspiradora EDC).</span></div>
                  <div class="step-card__params"><strong>Atención:</strong> si el filtro o el tubo se tapan, la aspiradora hace <strong>ruidos anormales</strong> — hay que limpiarlos seguido.</div>
                </div>

                <div class="alert-box">Todo este ciclo lo coordinan <strong>6 levas</strong> (Alimentación, Admisión, Dosificación, Descargas, Cierre y Eliminación de residuos). Su posición viene ajustada de fábrica: <strong>no se reajusta</strong> salvo emergencia, porque desincronizarlas daña componentes.</div>
              `
            },
            {
              id: "flujo-es",
              title: "Entradas → Transformación → Salidas",
              content: `
                <p>Es la forma más sencilla de entender (y diagnosticar) cualquier máquina: todo lo que <strong>entra</strong>, cómo se <strong>transforma</strong> y todo lo que <strong>sale</strong>. Si una salida está mal, casi siempre el problema está en una entrada o en la transformación.</p>

                <div class="io-flow">
                  <div class="io-col io-col--in">
                    <div class="io-col__head">↘ ENTRADAS<small>Lo que la máquina necesita para trabajar</small></div>
                    <div class="io-col__body">
                      <ul>
                        <li><strong>Energía eléctrica</strong> — 10,5 kW, alimentación trifásica AC + fuente conmutada 24 VDC. Mueve motor, variador, PLC y controles.</li>
                        <li><strong>Aire comprimido / equipos a presión</strong> — para partes a presión. (El manual no da el valor de presión: <span class="src-tag src-reco">VALIDAR EN PLANTA</span>)</li>
                        <li><strong>Vacío</strong> — 0,02–0,04 MPa, de la bomba de anillo de agua serie SK. Abre las cápsulas y asiste el rechazo.</li>
                        <li><strong>Agua de servicio</strong> — alimenta la bomba de vacío de anillo de agua (regula el nivel de vacío).</li>
                        <li><strong>Cápsulas vacías</strong> — materia prima, formatos 000# a 5#.</li>
                        <li><strong>Producto</strong> — polvo o micropellets a encapsular.</li>
                        <li><strong>Lubricantes</strong> — STABYL 300 AL 2, Fuchs GERALYN 1, N4B GB443-84, ZL2 / ZLD SY1412-75.</li>
                      </ul>
                    </div>
                  </div>
                  <div class="io-col io-col--proc">
                    <div class="io-col__head">⟳ TRANSFORMACIÓN<small>Lo que pasa adentro</small></div>
                    <div class="io-col__body">
                      <ul>
                        <li>El <strong>ciclo de 8 pasos</strong>: ordena → abre por vacío → dosifica → rechaza → cierra → expulsa → limpia.</li>
                        <li>En una <strong>torreta giratoria</strong> de segmentos de 25 orificios.</li>
                        <li>Sincronizado por <strong>6 levas</strong>.</li>
                        <li>Accionado por <strong>motor SEW + variador Emerson + PLC Siemens</strong> con HMI táctil.</li>
                        <li>Auxiliares: <strong>vacío</strong> (bomba SK) y <strong>aspiración de polvo</strong> (colector EDC).</li>
                      </ul>
                      <p style="font-size:0.84rem;color:var(--muted);margin:8px 0 0">Ver el detalle paso a paso en <strong>“¿Cómo funciona?”</strong>.</p>
                    </div>
                  </div>
                  <div class="io-col io-col--out">
                    <div class="io-col__head">↗ SALIDAS<small>Lo que sale (deseado y no deseado)</small></div>
                    <div class="io-col__body">
                      <ul>
                        <li><strong>✓ Producto:</strong> cápsulas llenas y cerradas (se pueden pulir en pulidora opcional).</li>
                        <li><strong>Cápsulas rechazadas</strong> / de desecho, aspiradas a la caja de desecho.</li>
                        <li><strong>⚠ Polvo / partículas</strong> — pueden ser <strong>tóxicas</strong> y hay <strong>riesgo de explosión de polvo</strong>. Se filtran, pero el filtro no atrapa todo.</li>
                        <li><strong>Polvo residual</strong> aspirado al contenedor del colector.</li>
                        <li><strong>Drenaje, rebose y escape</strong> del circuito de vacío (agua/aire).</li>
                        <li><strong>Ruido</strong> — por eso bomba y colector van separados.</li>
                        <li><strong>Residuos peligrosos</strong> — gestionarlos con el sistema de eliminación de sustancias peligrosas.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h4>La salida que nos importa en mantenimiento: “máquina funcional”</h4>
                <p>Para producción la salida es el producto; para <strong>mantenimiento</strong>, nuestra salida es que la <strong>máquina esté funcional y disponible</strong>. Eso no se mide “a ojo”: se mide con <strong>indicadores</strong> (MTBF, MTTF, MTTR, disponibilidad, tiempo de paro). Ver la sección <strong>“Indicadores de mantenimiento”</strong>.</p>

                <div class="alert-box">⚠ <strong>Seguridad (aplica en todo el flujo):</strong> energía cero antes de intervenir (apagar interruptor principal y bloquear) · liberar la presión antes de tocar sistemas neumáticos/de vacío · limpiar el interior <strong>solo con aspiradora</strong>, nunca con aire soplado · el polvo puede ser tóxico e inflamable: usar ropa antiestática y retirarlo de inmediato.</div>
              `
            },
            {
              id: "indicadores",
              title: "Indicadores de mantenimiento (MTBF, MTTF, MTTR, disponibilidad)",
              content: `
                <p><span class="src-tag src-reco">NO ESTÁ EN EL MANUAL</span> &nbsp;El manual no define indicadores. Los agregamos como <strong>estándar de mantenimiento</strong> porque son la forma de medir si la máquina cumple su salida real: <strong>estar funcional y disponible</strong>. Para calcularlos solo necesitas anotar cada falla: <strong>fecha, qué falló y cuánto tardó en repararse</strong>.</p>

                <div class="kpi-grid">
                  <div class="kpi-card">
                    <h5>MTBF</h5>
                    <div class="kpi-sig">Tiempo medio entre fallas · mide fiabilidad</div>
                    <div class="kpi-formula">MTBF = horas de operación ÷ nº de fallas</div>
                    <p>Cuánto aguanta la máquina trabajando antes de fallar. <strong>Mientras más alto, mejor.</strong> Si baja, la máquina está fallando más seguido.</p>
                  </div>
                  <div class="kpi-card">
                    <h5>MTTF</h5>
                    <div class="kpi-sig">Tiempo medio hasta la falla · piezas que se cambian</div>
                    <div class="kpi-formula">MTTF = horas totales ÷ nº de piezas</div>
                    <p>Para piezas que <strong>no se reparan, se reemplazan</strong> (rodamientos, filtros, correas). Te dice cada cuánto cambiar el consumible.</p>
                  </div>
                  <div class="kpi-card">
                    <h5>MTTR</h5>
                    <div class="kpi-sig">Tiempo medio de reparación · mide rapidez</div>
                    <div class="kpi-formula">MTTR = horas de reparación ÷ nº de reparaciones</div>
                    <p>Cuánto tardas en dejarla andando otra vez. <strong>Mientras más bajo, mejor.</strong> Mejora con repuestos a mano y procedimientos claros.</p>
                  </div>
                  <div class="kpi-card">
                    <h5>Disponibilidad</h5>
                    <div class="kpi-sig">% del tiempo que la máquina está lista</div>
                    <div class="kpi-formula">Disponibilidad = MTBF ÷ (MTBF + MTTR) × 100</div>
                    <p>El resumen de todo: qué porcentaje del tiempo la máquina <strong>puede producir</strong>. Es el número que mira tu jefe.</p>
                  </div>
                  <div class="kpi-card">
                    <h5>Tiempo de paro</h5>
                    <div class="kpi-sig">Downtime · horas detenida por falla</div>
                    <div class="kpi-formula">Σ horas que la máquina estuvo parada</div>
                    <p>El total de horas perdidas por fallas en un periodo. Sirve para priorizar qué falla atacar primero (la que más para la máquina).</p>
                  </div>
                  <div class="kpi-card">
                    <h5>Paro post-mantenimiento</h5>
                    <div class="kpi-sig">Calidad del mantenimiento</div>
                    <div class="kpi-formula">Horas hasta volver a producir bien tras un mtto.</div>
                    <p>Cuánto tarda en volver a producir <strong>bien</strong> después de un mantenimiento. Si es alto, el mantenimiento se está haciendo mal o incompleto.</p>
                  </div>
                </div>

                <div class="alert-box" style="background:#eef4ff;border-color:#cdddff"><strong>Cómo empezar sin complicarte:</strong> lleva una bitácora simple por máquina con una fila por falla → <em>fecha · sistema · qué pasó · cuánto tardó en repararse · repuesto usado</em>. Con eso ya puedes calcular MTBF, MTTR y disponibilidad mes a mes, y ver si una falla se repite mucho (eso es lo que dispara ajustar el plan de mantenimiento).</div>
              `
            },
            {
              id: "plan-mantenimiento",
              title: "Plan de mantenimiento por niveles (Mensual / Trimestral / Semestral)",
              content: `
                <p>El manual da las <strong>tareas</strong>, pero casi no da frecuencias (la mayoría dice solo “según lote”). Así que las <strong>frecuencias por nivel las definimos nosotros</strong> con criterio de mantenimiento, y se <strong>ajustan según cómo se comporte la máquina</strong>.</p>
                <p style="font-size:0.9rem;color:var(--muted)"><span class="src-tag src-manual">MANUAL</span> = frecuencia que sí indica el manual. &nbsp; <span class="src-tag src-reco">RECOMENDADO</span> = frecuencia que proponemos nosotros (ajústala a tu planta).</p>

                <div class="tier-head"><span class="tier-chip tier-chip--otros">RUTINA</span> <small>Diario y semanal · lo básico que evita el 80% de los problemas</small></div>
                <table class="crit-table"><tbody>
                  <tr><th>Frecuencia</th><th>Tarea</th><th>Sistema</th></tr>
                  <tr><td>Diario <span class="src-tag src-manual">MANUAL</span></td><td>Limpieza: retirar restos y limpiar la cubierta protectora — <strong>solo con aspiradora</strong></td><td>Limpieza</td></tr>
                  <tr><td>Diario <span class="src-tag src-reco">RECOM.</span></td><td>Inspección visual general + verificar nivel de vacío en el manómetro (0,02–0,04 MPa)</td><td>General / Vacío</td></tr>
                  <tr><td>Diario <span class="src-tag src-reco">RECOM.</span></td><td>Limpiar sensores (paño suave sin pelusa) y la zona de descarga de cápsulas vacías al terminar</td><td>Control / Alimentación</td></tr>
                  <tr><td>Semanal <span class="src-tag src-reco">RECOM.</span></td><td>Limpieza a fondo de moldes y estaciones (solo aspiradora); revisar fugas de mangueras y racores</td><td>Moldes / Neumática</td></tr>
                  <tr><td>Semanal <span class="src-tag src-reco">RECOM.</span></td><td>Inspeccionar filtro/malla del colector de polvo y tubo de succión (ruido anormal = obstrucción)</td><td>Aspiración</td></tr>
                  <tr><td>Semanal <span class="src-tag src-reco">RECOM.</span></td><td>Lubricar bloqueos de torque de estaciones (rechazo, cierre, dispensación) con STABYL 300 AL 2</td><td>Lubricación</td></tr>
                </tbody></table>

                <div class="tier-head"><span class="tier-chip tier-chip--m">MENSUAL · M</span> <small>Inspección y limpieza más a fondo</small></div>
                <table class="crit-table"><tbody>
                  <tr><th>Tarea</th><th>Sistema</th><th>Criterio</th></tr>
                  <tr><td>Comprobar elementos de fijación: pernos, tornillos, tuercas y autoblocantes</td><td>Estructura</td><td>Sin aflojamiento ni desprendimiento</td></tr>
                  <tr><td>Revisar tensión y estado de la correa de distribución y la cadena</td><td>Transmisión</td><td>Sin daños y bien tensada</td></tr>
                  <tr><td>Limpiar el dispositivo de filtro de vacío, reemplazar filtro y limpiar el interruptor de presión</td><td>Vacío</td><td>Filtro limpio; sin fugas</td></tr>
                  <tr><td>Probar el interruptor de la puerta (enclavamiento de seguridad)</td><td>Seguridad</td><td>Enclavamiento funcionando</td></tr>
                  <tr><td>Comprobar equipos eléctricos sin daños (con LOTO / máquina sin tensión)</td><td>Eléctrico</td><td>Sin daños</td></tr>
                  <tr><td>Lubricar leva radial (STABYL 300 AL 2) y riel guía / propulsor direccional (Fuchs GERALYN 1)</td><td>Lubricación</td><td>1–2 disparos por punto</td></tr>
                </tbody></table>

                <div class="tier-head"><span class="tier-chip tier-chip--3m">TRIMESTRAL · 3M</span> <small>Consumibles, aceite y verificación de holguras</small></div>
                <table class="crit-table"><tbody>
                  <tr><th>Tarea</th><th>Sistema</th><th>Criterio / dato</th></tr>
                  <tr><td>Comprobar y rellenar el aceite del reductor</td><td>Reductor</td><td>Nivel correcto (aceite según fabricante del reductor SEW)</td></tr>
                  <tr><td>Lubricación general según Tabla 4.1: cadena, rodamientos, componente guía (N4B GB443-84); levas (ZL2 SY1412-75); caja de distribución (ZLD SY1412-75)</td><td>Lubricación</td><td>Todos los puntos cubiertos</td></tr>
                  <tr><td>Verificar holguras de dosificación: disco–almohadilla de cobre y raspador de polvo</td><td>Dosificación</td><td>0,05–0,15 mm y 0,05–0,1 mm</td></tr>
                  <tr><td>Verificar nivel de detector de polvo y vacío + holgura del asiento de succión</td><td>Vacío / Control</td><td>Detector 18–28 mm · asiento 1,8–2,5 mm</td></tr>
                  <tr><td>Reemplazar consumibles de desgaste según estado (filtros, sellos)</td><td>Varios</td><td>Cambio preventivo</td></tr>
                </tbody></table>

                <div class="tier-head"><span class="tier-chip tier-chip--6m">SEMESTRAL · 6M</span> <small>Revisión profunda / overhaul</small></div>
                <table class="crit-table"><tbody>
                  <tr><th>Tarea</th><th>Sistema</th><th>Criterio / dato</th></tr>
                  <tr><td>Calibrar moldes: concentricidad de orificios y separación entre módulos</td><td>Moldes</td><td>Concentricidad 0,01–0,02 mm · separación 0,2–0,3 mm</td></tr>
                  <tr><td>Revisar rodamientos por zona (catálogo Tabla 4.3) y reemplazar los desgastados</td><td>Rodamientos</td><td>Sin juego ni ruido</td></tr>
                  <tr><td>Revisar punzones y disco dosificador por desgaste</td><td>Dosificación</td><td>Dosis estable; sin marcas</td></tr>
                  <tr><td>Cambiar el aceite del reductor</td><td>Reductor</td><td>Aceite renovado</td></tr>
                  <tr><td>Verificación completa de calibraciones de cierre, eyección y rechazo</td><td>Cierre / Rechazo</td><td>Holguras dentro de rango</td></tr>
                </tbody></table>

                <div class="tier-head"><span class="tier-chip tier-chip--6m">ANUAL</span> <small>Indicado por el manual</small></div>
                <table class="crit-table"><tbody>
                  <tr><th>Tarea</th><th>Sistema</th><th>Frecuencia</th></tr>
                  <tr><td>Sustituir la batería de reserva del PLC</td><td>Control / PLC</td><td>Cada 12 meses <span class="src-tag src-manual">MANUAL</span></td></tr>
                  <tr><td>Inspección profesional de dispositivos de seguridad, bloqueos y sistema de eliminación de sustancias peligrosas (registrar en certificado)</td><td>Seguridad</td><td>Anual <span class="src-tag src-manual">MANUAL</span></td></tr>
                </tbody></table>

                <h4>Cómo ajustar la frecuencia (lo más importante)</h4>
                <p>El plan no es fijo. Se mueve según cómo se porte la máquina:</p>
                <ul>
                  <li><strong>Si una falla se repite</strong> o hubo un golpe / desgaste acelerado → <strong>haz ese mantenimiento más seguido</strong> (sube de nivel: lo semestral pásalo a trimestral, etc.).</li>
                  <li><strong>Si una falla concreta sube en frecuencia</strong> → atácala en su sistema con mantenimiento más regular hasta que se estabilice.</li>
                  <li><strong>Si todo está estable mucho tiempo</strong> → puedes espaciar un poco (sin pasarte).</li>
                  <li>Conéctalo a los <strong>indicadores</strong>: si el <strong>MTBF baja</strong> (falla más seguido), aumenta la frecuencia preventiva en ese sistema.</li>
                </ul>
                <div class="alert-box">Regla práctica: el plan preventivo existe para que las fallas <strong>no</strong> aparezcan. Si una falla igual aparece seguido, el plan de ese sistema se quedó corto → acórtale el intervalo y revisa la causa raíz.</div>
              `
            },
            {
              id: "loto",
              title: "Bloqueo y consignación de energía (LOTO)",
              content: `
<div class="alert-box">⚠ NO intervengas la encapsuladora NJP-3500 sin completar antes TODO este procedimiento. Solo personal capacitado y autorizado puede realizar instalación, mantenimiento o reparación. Si el trabajo es eléctrico o sobre partes conductoras, debe hacerse SIEMPRE acompañado de una segunda persona que pueda accionar el paro de emergencia.</div>

<p>Este procedimiento de Bloqueo y Consignación de Energía (LOTO) se ejecuta <strong>antes de cualquier mantenimiento, reparación, limpieza interna o cambio de formato</strong>. Sigue los pasos en orden. No saltes ninguno. La máquina tiene varias fuentes de energía peligrosa que debes neutralizar: energía eléctrica, vacío y aire comprimido/presión, y energía mecánica almacenada en partes móviles.</p>

<table class="crit-table"><tbody>
<tr><th>Fuente de energía</th><th>Cómo se neutraliza en este procedimiento</th></tr>
<tr><td>Eléctrica (motor SEW, variador, PLC, 10,5 kW)</td><td>Apagar interruptor principal + desconectar conector principal + bloquear armario</td></tr>
<tr><td>Vacío (bomba anillo de agua serie SK, 0,02-0,04 MPa)</td><td>Liberar el vacío y abrir a presión atmosférica</td></tr>
<tr><td>Aire comprimido / presión</td><td>Asegurar el generador de presión y liberar la presión almacenada <span class="src-tag src-reco">VALIDAR EN PLANTA</span> el valor de presión</td></tr>
<tr><td>Mecánica almacenada / térmica</td><td>Detener el movimiento, fijar partes móviles y dejar enfriar componentes calientes</td></tr>
</tbody></table>

<h3>A) Consignación: dejar la máquina sin energía</h3>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Parada normal de la máquina</span></div>
<div class="step-card__row"><span>Acción</span><span>Detén la máquina con el botón de Parada del HMI y espera a que el plato giratorio y todos los mecanismos queden completamente quietos. No uses el paro de emergencia como parada de rutina.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Movimiento totalmente detenido en la mesa giratoria, alimentador y dosificador antes de continuar.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Aislar la unidad de potencia</span></div>
<div class="step-card__row"><span>Acción</span><span>Aísla la unidad de potencia antes de intervenir. Asegúrate de que la máquina no pueda encenderse de forma inesperada durante el trabajo.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Que ninguna persona pueda volver a poner la máquina en marcha mientras se trabaja (origen: aislamiento previo a mantenimiento, p5 / 2.4).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">Apagar el interruptor principal</span></div>
<div class="step-card__row"><span>Acción</span><span>Lleva el interruptor principal a la posición OFF (apagado). Este es el corte de la energía eléctrica de la máquina.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Interruptor principal en OFF; el HMI y los pilotos de la máquina se apagan.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Desconectar el conector principal</span></div>
<div class="step-card__row"><span>Acción</span><span>Desconecta físicamente el conector principal de alimentación, de modo que la máquina quede separada de la red. Apagar el interruptor por sí solo no basta.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Conector principal desenchufado/desacoplado (origen: 2.4, p5).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Cerrar con llave el armario de control y retirar la llave</span></div>
<div class="step-card__row"><span>Acción</span><span>Cierra con llave el armario de control principal, retira la llave y guárdala en poder de quien realiza la intervención. Así nadie puede reconectar ni manipular el control.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Armario cerrado con llave y llave retirada y en custodia del técnico (origen: Tabla 2.5 / 5.1).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">Colocar señal / candado-tarjeta en el interruptor principal</span></div>
<div class="step-card__row"><span>Acción</span><span>Coloca la señal de advertencia (y candado-tarjeta de bloqueo) en el interruptor principal indicando que la máquina está consignada y NO debe energizarse. Esto activa el bloqueo de seguridad antes de trabajar.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Señal de advertencia colocada en el interruptor principal. El manual exige señal y bloqueo; el tipo y modelo de candado/tarjeta físico <span class="src-tag src-reco">VALIDAR EN PLANTA</span> (origen: Tabla 2.5 / 5.1).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">Liberar la presión de vacío y neumática</span></div>
<div class="step-card__row"><span>Acción</span><span>Antes de usar o intervenir equipos con aire comprimido, presión de vapor o presión hidráulica, asegura el generador de presión y libera toda la presión almacenada. Libera también el vacío del circuito de la bomba serie SK (que opera a 0,02-0,04 MPa). Si vas a abrir la tapa del filtro de vacío, libera primero su presión.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Manómetro de vacío en cero; sistema a presión atmosférica; sin presión residual antes de abrir filtros o tapas (origen: Tabla 2.5; 10.1; vacío p44). Valor de presión del aire comprimido <span class="src-tag src-reco">VALIDAR EN PLANTA</span> (el manual no lo especifica).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">Fijar partes móviles y dejar enfriar</span></div>
<div class="step-card__row"><span>Acción</span><span>Protege y asegura las partes móviles a presión con sus dispositivos de fijación, para que no se desplacen por energía mecánica almacenada. Deja enfriar por completo todos los componentes que generan calor antes de tocarlos.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Partes móviles fijadas; componentes calientes a temperatura segura al tacto (origen: Tabla 2.5). Tiempo de enfriamiento <span class="src-tag src-reco">VALIDAR EN PLANTA</span>.</div>
</div>

<h3>B) Verificación de energía cero (obligatoria para trabajo eléctrico)</h3>

<div class="alert-box">⚠ El trabajo sobre partes conductoras o de alto voltaje NUNCA se hace en solitario. Trabaja siempre con una segunda persona que pueda presionar el interruptor de emergencia. Acordona/acuerda la zona y usa únicamente herramientas eléctricas aisladas.</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">Verificar ausencia de tensión</span></div>
<div class="step-card__row"><span>Acción</span><span>Con instrumento adecuado, comprueba que NO hay tensión en los puntos donde vas a trabajar. No confíes solo en que el interruptor esté en OFF: verifica.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Ausencia de tensión confirmada antes de tocar conductores (origen: trabajo en partes conductoras, 2.6.1).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">10</span><span class="step-card__title">Aterrizar y cortocircuitar con varilla de puesta a tierra</span></div>
<div class="step-card__row"><span>Acción</span><span>Tras desconectar la fuente, conecta a tierra y cortocircuita los componentes con la varilla de puesta a tierra. Esto descarga cualquier energía residual antes de manipular.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Componentes aterrizados y cortocircuitados con varilla de puesta a tierra; herramientas usadas, todas aisladas (origen: 2.6.1).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">11</span><span class="step-card__title">Trabajar acompañado y con la zona controlada</span></div>
<div class="step-card__row"><span>Acción</span><span>Realiza el trabajo con una segunda persona presente que pueda accionar el paro de emergencia. Mantén la zona acordonada. NO laves el armario de control con pistola de agua ni equipos de limpieza a alta presión.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Segunda persona en posición para el paro de emergencia; zona acordonada; prohibición de agua a presión sobre el armario respetada (origen: 2.6.1; 2.7.1).</div>
</div>

<div class="alert-box">⚠ Riesgo de polvo: el polvo del producto puede causar intoxicación grave y explosión por chispa o electricidad estática. Usa ropa antiestática, retira el polvo de inmediato y nunca generes chispas cerca de acumulaciones de polvo (origen: 2.8). En caso de incendio, usa extintor de CO2 (2.7.1).</div>

<h3>C) Reposición segura de energía al terminar</h3>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">12</span><span class="step-card__title">Retirar herramientas, tierras y cerrar la máquina</span></div>
<div class="step-card__row"><span>Acción</span><span>Retira la varilla de puesta a tierra/cortocircuito y todas las herramientas del interior. Confirma que no quedan piezas, trapos ni objetos sueltos. Vuelve a montar y asegurar las protecciones: la máquina solo debe usarse con todos los dispositivos de protección instalados y funcionando.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Varilla de tierra retirada; cero herramientas u objetos dentro; todas las protecciones y resguardos montados (origen: 2.3).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">13</span><span class="step-card__title">Comprobar fijaciones y enclavamientos</span></div>
<div class="step-card__row"><span>Acción</span><span>Revisa que pernos, tornillos, tuercas y elementos de fijación queden apretados (reemplaza de inmediato los tornillos autoblocantes sueltos). Verifica que el interruptor de la puerta (enclavamiento de seguridad) funciona correctamente.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Sin fijaciones sueltas; enclavamiento de puerta operativo (origen: plan de mantenimiento puntos 6 y 8; 3.3.7.1).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">14</span><span class="step-card__title">Retirar el bloqueo y reconectar</span></div>
<div class="step-card__row"><span>Acción</span><span>Solo quien colocó el bloqueo retira la señal/candado-tarjeta del interruptor principal. Avisa y aleja a todo el personal de las partes móviles. Vuelve a conectar el conector principal, abre el armario con su llave (vuelve a cerrarlo) y pon el interruptor principal en ON.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Solo el responsable del bloqueo lo retira; personal alejado de zonas móviles antes de energizar (origen: Tabla 2.5 / 5.1).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">15</span><span class="step-card__title">Giro manual de verificación antes de arrancar</span></div>
<div class="step-card__row"><span>Acción</span><span>Antes de arrancar el motor, coloca el volante en el eje del motor principal y gira manualmente 3 a 5 vueltas en sentido horario, observando que todas las piezas se muevan correctamente, sin ruido anormal ni fricción.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> 3 a 5 vueltas sin anomalías, sin ruido ni roce (origen: 3.3.7.2, p21 / p68).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">16</span><span class="step-card__title">Restablecer vacío/presión y arranque gradual</span></div>
<div class="step-card__row"><span>Acción</span><span>Restablece la entrada de agua y ajusta el vacío con su válvula leyendo el manómetro. Arranca la máquina desde el HMI y aumenta la velocidad de forma gradual, vigilando el funcionamiento.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Vacío operativo entre 0,02 y 0,04 MPa; arranque con velocidad creciente y funcionamiento correcto (origen: 3.4.15, p44; arranque gradual p68).</div>
</div>

<div class="alert-box">⚠ Si durante la verificación o el arranque aparece cualquier ruido anormal, fricción, fuga o comportamiento inesperado, vuelve a parar la máquina, repite la consignación (pasos 1-8) e investiga antes de continuar. No operes la máquina con errores ni con protecciones retiradas.</div>
              `
            },
            {
              id: "arranque-produccion",
              title: "Arranque de producción (paso a paso)",
              content: `
<div class="alert-box">⚠ Antes de tocar nada: lee y entiende el manual y las medidas de seguridad. Solo personal capacitado y autorizado puede operar la NJP-3500. La máquina solo debe usarse con TODOS los dispositivos de protección instalados y funcionando. Usa ropa antiestática (riesgo de explosión e intoxicación por polvo del producto).</div>

<p>Este es el procedimiento de arranque de producción de la encapsuladora NJP-3500. Sigue los pasos EN ORDEN. No saltes ninguna verificación previa. Los botones que se nombran (entre comillas) son los botones reales de la pantalla táctil (HMI) de la máquina.</p>

<h3>Botones de la HMI que vas a usar</h3>
<table class="crit-table"><tbody>
<tr><th>Botón en la HMI</th><th>Para qué sirve</th></tr>
<tr><td>"Paso a paso (jogging) unidad principal"</td><td>Gira la máquina principal poco a poco (impulsos cortos) para posicionar/verificar sin arrancar a velocidad.</td></tr>
<tr><td>"Paso a paso ventilador"</td><td>Acciona por impulsos el ventilador del colector de polvo para comprobar que aspira.</td></tr>
<tr><td>"Ascenso/Descenso de la tolva (Hopper Up/Descent)"</td><td>Sube o baja la tolva para cargar cápsulas vacías y dejarla en posición de trabajo.</td></tr>
<tr><td>"Apertura/Cierre de cápsulas (Open/Close capsule)"</td><td>Abre o cierra el mecanismo de cápsulas (posición de carga / posición de proceso).</td></tr>
<tr><td>"Arranque"</td><td>Pone la máquina en marcha de producción.</td></tr>
<tr><td>"Parada (Stop)"</td><td>Detiene la máquina de forma normal. (El paro de emergencia es un botón físico aparte.)</td></tr>
</tbody></table>

<h3>BLOQUE A — Verificaciones previas (NO arrancar sin completarlas)</h3>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Guardas cerradas y enclavamiento de puerta OK</span></div>
<div class="step-card__row"><span>Acción</span><span>Cierra todas las puertas y guardas de protección. Comprueba que el interruptor de la puerta (enclavamiento de seguridad) no esté dañado y actúe: la máquina no debe poder arrancar con una guarda abierta.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Enclavamiento de puerta funcionando correctamente. Todos los dispositivos de protección instalados. El botón de paro de emergencia accesible y sin enclavar.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Fijaciones, moldes y entorno</span></div>
<div class="step-card__row"><span>Acción</span><span>Revisa que pernos, tornillos, tuercas y pasadores estén apretados (las vibraciones de transporte aflojan tornillos). Confirma que los moldes y la placa dosificadora estén montados sin golpes ni daños. La mesa debe estar nivelada, estable y sobre su almohadilla de goma, sin tambaleos.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Sin tornillos sueltos ni piezas flojas. Reemplaza de inmediato cualquier tornillo autoblocante suelto.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">Nivel de agua de la bomba de vacío SK</span></div>
<div class="step-card__row"><span>Acción</span><span>Comprueba el agua de la bomba de vacío de anillo de agua serie SK: abre la válvula de entrada de agua en la parte inferior del tanque para que la bomba tenga su anillo de agua antes de generar vacío. Verifica el depósito de agua de circulación de vacío.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> La bomba SK trabaja con anillo de agua (no en seco). <span class="src-tag src-reco">VALIDAR EN PLANTA</span> El manual no da el nivel/caudal/temperatura exactos del agua: definir con la ficha de la bomba SK (Zhejiang Xinhuan).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Vacío en rango en el manómetro</span></div>
<div class="step-card__row"><span>Acción</span><span>Arranca la bomba de vacío y lee el manómetro de vacío. Si está fuera de rango, ajusta abriendo/cerrando la válvula de entrada de agua del tanque hasta entrar en rango. Sin el vacío correcto las cápsulas no se separan o se dañan.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Vacío operativo entre <strong>0,02 y 0,04 MPa</strong> en el manómetro (p44).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Colector de polvo operativo</span></div>
<div class="step-card__row"><span>Acción</span><span>Confirma que la aspiradora / colector de polvo (EDC) esté encendido y aspirando. Comprueba que la malla del filtro y el tubo de succión no estén obstruidos (un colector tapado hace ruidos anormales). Usa "Paso a paso ventilador" para verificar el accionamiento del ventilador.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Colector aspirando, malla y tubo limpios, sin ruidos anormales. El colector previene intoxicación por polvo y reduce riesgo de explosión.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">Carga de cápsulas vacías (tolva)</span></div>
<div class="step-card__row"><span>Acción</span><span>Con "Ascenso/Descenso de la tolva (Hopper Up/Descent)" sube/baja la tolva según necesites cargarla. Carga las cápsulas vacías del formato correcto (000# a 5#). Ajusta la compuerta deslizante con su tuerca para que la altura de las cápsulas en la salida sea aproximadamente la mitad de la altura total de salida.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Formato de cápsula correcto. Altura de cápsulas en la compuerta ≈ mitad de la altura total de salida (p22). Una cápsula administrada a la vez.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">Carga de producto y dosificación</span></div>
<div class="step-card__row"><span>Acción</span><span>Vierte el polvo (o micropellets) en la tolva de polvo. Confirma que las profundidades de los punzones por estación correspondan a la dosis deseada (a más profundidad, más densidad/dosis).</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Profundidad de émbolo por estación 6 / 4 / 3 / 2 / 0,5 mm (Est. 1-5, p38). Solo producto y material autorizados por el pedido.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">Posicionar el mecanismo de cápsulas</span></div>
<div class="step-card__row"><span>Acción</span><span>Con "Apertura/Cierre de cápsulas (Open/Close capsule)" deja el mecanismo en la posición correcta de proceso. Usa "Paso a paso (jogging) unidad principal" en impulsos cortos para acompañar el posicionamiento si hace falta.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Mecanismo de cápsulas en posición de trabajo, sin atascos en la zona de descarga de cápsulas vacías.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">Giro manual de verificación (3-5 vueltas)</span></div>
<div class="step-card__row"><span>Acción</span><span>Coloca el volante en el eje trasero del motor principal y gira a mano en sentido horario. Observa que todas las piezas se muevan correctamente, sin ruido anormal ni fricción. Si notas desalineación o roce, NO arranques: revisa el montaje.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> 3 a 5 vueltas completas sin anomalías, sin ruido ni fricción (p21, p68).</div>
</div>

<div class="alert-box">⚠ Si CUALQUIERA de los pasos 1 a 9 falla (guarda abierta, vacío fuera de rango, colector tapado, ruido al girar a mano, tornillo suelto), detente y corrige antes de continuar. No fuerces el arranque.</div>

<h3>BLOQUE B — Arranque con rampa gradual de velocidad</h3>

<div class="alert-box">⚠ NUNCA arranques a velocidad máxima de golpe. Tras pulsar "Arranque", sube la velocidad de forma gradual con el regulador de velocidad de la HMI (variador de frecuencia).</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">10</span><span class="step-card__title">Energizar y poner en marcha</span></div>
<div class="step-card__row"><span>Acción</span><span>Con todas las verificaciones del Bloque A correctas (guardas cerradas, vacío 0,02-0,04 MPa, colector aspirando), enciende el interruptor de alimentación y pulsa "Arranque" en la HMI. Deja la velocidad en el valor MÍNIMO al iniciar.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> La HMI no muestra ninguna alarma. Si aparece un error, la máquina se detiene: consulta en pantalla síntoma/causa/solución y resuelve antes de seguir.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">11</span><span class="step-card__title">Subir la velocidad por rampa</span></div>
<div class="step-card__row"><span>Acción</span><span>Aumenta la velocidad de forma gradual y escalonada con el regulador de la HMI, no de golpe. En cada escalón, observa el funcionamiento (alimentación de cápsulas, dosificación, cierre, expulsión) antes de subir más. Detente con "Parada (Stop)" si escuchas o ves algo anómalo.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Movimiento suave, sin ruidos ni golpes, dosificación estable. <span class="src-tag src-reco">VALIDAR EN PLANTA</span> El manual indica subir la velocidad "gradualmente" tras el arranque (p68) pero NO da los escalones ni los segundos de cada rampa ni la velocidad de régimen: definir según el producto y la experiencia de planta.</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">12</span><span class="step-card__title">Marcha de prueba y control de calidad</span></div>
<div class="step-card__row"><span>Acción</span><span>Deja estabilizar la máquina y revisa las primeras cápsulas: peso/dosis, cierre completo y sin defectos. Comprueba que las cápsulas rechazadas salgan a la caja de almacenamiento y que el colector limpie el polvo residual.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Vacío sigue en 0,02-0,04 MPa. Cápsulas bien cerradas y con dosis correcta. <span class="src-tag src-reco">VALIDAR EN PLANTA</span> El manual no define criterios de aceptación (peso objetivo, % rechazo, OEE): establecerlos en planta. En la puesta en marcha inicial, hacer marcha de prueba en vacío 1-2 horas (p21).</div>
</div>

<div class="step-card">
<div class="step-card__head"><span class="step-card__num">13</span><span class="step-card__title">Llevar a velocidad de producción</span></div>
<div class="step-card__row"><span>Acción</span><span>Una vez confirmada la calidad, termina de subir la velocidad por rampa hasta el régimen de producción y deja la máquina en marcha continua bajo vigilancia.</span></div>
<div class="step-card__params"><strong>Verificar:</strong> Producción nominal de referencia 3500 cápsulas/min con 25 orificios por segmento (p12). Mantén la velocidad final dentro de lo validado para tu producto.</div>
</div>

<h3>Parada</h3>
<p>Para detener la producción de forma normal, baja la velocidad y pulsa "Parada (Stop)" en la HMI. Para emergencias usa el botón físico de parada de emergencia. Tras parar, limpia de inmediato la zona de descarga de cápsulas vacías para evitar atascos en el siguiente arranque. Para cualquier intervención de mantenimiento: apaga el interruptor principal, aplica bloqueo (LOTO) y libera la presión de los equipos a presión antes de tocar partes móviles.</p>

<table class="crit-table"><tbody>
<tr><th>Dato crítico de arranque</th><th>Valor</th><th>Fuente</th></tr>
<tr><td>Vacío operativo (manómetro)</td><td>0,02 - 0,04 MPa</td><td>Manual p44</td></tr>
<tr><td>Giro manual de verificación previo</td><td>3 a 5 vueltas sin anomalías</td><td>Manual p21 / p68</td></tr>
<tr><td>Arranque de velocidad</td><td>Gradual (rampa), no a tope de golpe</td><td>Manual p68</td></tr>
<tr><td>Profundidad de punzón Est. 1-5</td><td>6 / 4 / 3 / 2 / 0,5 mm</td><td>Manual p38</td></tr>
<tr><td>Formato de cápsula</td><td>000# a 5#</td><td>Manual p12</td></tr>
<tr><td>Marcha en vacío (puesta en marcha inicial)</td><td>1 - 2 horas</td><td>Manual p21</td></tr>
<tr><td>Escalones/segundos de la rampa de velocidad</td><td>No especificado en el manual</td><td><span class="src-tag src-reco">VALIDAR EN PLANTA</span></td></tr>
</tbody></table>
              `
            },
            {
              id: "paro-vaciado",
              title: "Paro y vaciado de fin de lote",
              content: `
<p>Esta sección explica cómo detener la encapsuladora NJP-3500 al terminar un lote de forma ordenada, vaciarla y dejarla limpia y lista para el siguiente lote. Sigue los pasos en orden. No te saltes la limpieza de la zona de descarga de cápsulas vacías: el manual la exige de inmediato (Nota 3.4.1) para evitar atascos en el arranque siguiente.</p>

<div class="alert-box">Antes de empezar: distingue dos situaciones distintas. El <strong>paro normal de fin de lote</strong> es el que describe esta sección (paso a paso, con la máquina vacía y limpia). El <strong>paro de emergencia</strong> solo se usa si hay peligro para una persona o para el equipo (atasco grave, ruido o golpeteo anormal, riesgo de atrapamiento). Para la diferencia entre ambos, ver la tabla al final.</div>

<h3>A. Paro normal de fin de lote</h3>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Dejar de alimentar cápsulas y producto</span></div>
  <div class="step-card__row"><span>Acción</span><span>Con la máquina aún en marcha, deja de cargar cápsulas vacías en la tolva de cápsulas y deja de añadir polvo (o micropellets) en la tolva de producto. Si hay alimentador automático de cápsulas o dosificador de polvo, detén su alimentación primero.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>Permite que la máquina consuma lo que ya está dentro y se vacíe sola antes de parar, dejando menos producto y cápsulas sueltas dentro del circuito.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> deja de entrar cápsulas y polvo nuevos; el nivel de las dos tolvas baja.</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Dejar correr la máquina hasta vaciar el circuito</span></div>
  <div class="step-card__row"><span>Acción</span><span>Deja que la máquina siga girando unos segundos/minutos hasta que ya no salgan cápsulas terminadas y se hayan procesado las cápsulas que quedaban en las estaciones. Puedes ir bajando la velocidad desde la HMI.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>Vaciar "en marcha" evita dejar cápsulas a medio llenar o polvo compactado atrapado en los moldes y el disco dosificador.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> no salen más cápsulas por la descarga; la salida de producto terminado queda vacía.</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">Vaciar las tolvas</span></div>
  <div class="step-card__row"><span>Acción</span><span>Retira las cápsulas vacías que queden en la tolva de cápsulas y el polvo (o micropellets) que quede en la tolva de producto. Recoge el producto sobrante según el procedimiento de tu planta.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>El producto y las cápsulas que quedan en las tolvas pueden humedecerse, apelmazarse o contaminar el lote siguiente.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> ambas tolvas quedan vacías. <span class="src-tag src-reco">VALIDAR EN PLANTA</span> El destino del producto sobrante (reproceso, descarte o registro de lote) se define con el protocolo de la planta; el manual no lo especifica.</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Parar con el botón Parada (Stop)</span></div>
  <div class="step-card__row"><span>Acción</span><span>Pulsa el botón <strong>Parada</strong> (Stop) de la HMI / panel para detener el motor principal de forma controlada. Espera a que la máquina se detenga por completo antes de tocar nada.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>El botón Parada es el modo de paro previsto para la operación normal. No uses el paro de emergencia para terminar un lote (ver sección B).</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> el plato giratorio queda totalmente detenido y la HMI indica máquina parada.</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Apagar sistemas auxiliares (vacío y aspiración)</span></div>
  <div class="step-card__row"><span>Acción</span><span>Detén la bomba de vacío de anillo de agua (serie SK) y la aspiradora / colector de polvo (EDC). Si vas a abrir o intervenir el circuito de vacío o el filtro, libera primero la presión.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>Estos equipos están separados de la unidad principal por ruido y se gobiernan aparte; deben quedar parados al terminar el lote.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> bomba de vacío y aspiradora detenidas; el manómetro de vacío deja de marcar depresión. <span class="src-tag src-reco">VALIDAR EN PLANTA</span> El orden y el modo exacto de apagado del agua de la bomba SK se confirma en planta; el manual no detalla la secuencia de parada de auxiliares.</div>
</div>

<div class="alert-box">⚠ El polvo del producto puede ser tóxico y, acumulado, generar riesgo de explosión por chispa o electricidad estática. Retira el polvo de inmediato, usa ropa antiestática y no dejes polvo acumulado en la máquina ni en los equipos (manual 2.8).</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">Limpiar de inmediato la zona de descarga de cápsulas vacías</span></div>
  <div class="step-card__row"><span>Acción</span><span>Apenas termina la producción, limpia la zona de descarga de cápsulas vacías (salida/dispensado de cápsulas). Retira cápsulas atascadas, partidas o sueltas.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>El manual lo exige expresamente (Nota 3.4.1): limpiar de inmediato esta zona evita atascos en la producción siguiente. Es el paso que más fallos de arranque previene.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> zona de descarga de cápsulas vacías limpia, sin cápsulas atascadas ni restos. Criterio del manual: "zona de descarga limpia, sin atascos".</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">Limpieza interior SOLO con aspiradora</span></div>
  <div class="step-card__row"><span>Acción</span><span>Limpia el interior de la máquina (estaciones, moldes, disco dosificador, zona de llenado, restos de polvo) usando <strong>únicamente aspiradora</strong>. Limpia también los sensores con un paño suave sin pelusa.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>El manual indica que para la limpieza del interior solo pueden utilizarse aspiradoras (puntos 1/1.1). El molde tiene diseño de ensamblaje sellado y puede limpiarse sin desmontar.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> interior sin restos de polvo ni de cápsulas. No uses pistola de aire ni agua a presión sobre el armario de control (está prohibido lavarlo con agua a presión, 2.7.1).</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">Limpiar el filtro/malla del colector si hubo ruido</span></div>
  <div class="step-card__row"><span>Acción</span><span>Si durante el lote la aspiradora / colector de polvo hizo ruidos anormales, desmonta y limpia la malla del filtro y el tubo de succión (usa el botón de limpieza del colector). Antes de abrir la tapa del filtro de vacío, libera la presión.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>El ruido anormal indica obstrucción de la malla y el tubo por acumulación de polvo. Si no se limpian, el colector pierde aspiración y el polvo se acumula en la máquina.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> malla y tubo de succión sin obstrucción; al volver a usarlo, la aspiradora no hace ruidos anormales.</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">Dejar consignada (LOTO) si se va a intervenir</span></div>
  <div class="step-card__row"><span>Acción</span><span>Si después del paro vas a entrar a hacer mantenimiento, ajuste o reparación: apaga el interruptor principal, desconecta el conector principal, cierra con llave el armario de control y retira la llave, y coloca una señal de advertencia en el interruptor. Si hay equipos a presión, libera la presión antes de intervenir.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>Aísla la energía y evita un arranque inesperado mientras alguien trabaja en la máquina (manual 2.4, Tabla 2.5, punto 5.1).</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> máquina sin tensión y sin presión; armario cerrado con llave retirada y señal colocada. Los trabajos eléctricos solo los realiza un electricista cualificado.</div>
</div>

<div class="alert-box">⚠ Si solo vas a dejar la máquina en reposo entre lotes (sin abrirla ni intervenir), basta con el paro por botón Parada y el apagado ordenado. El bloqueo LOTO completo (paso 9) es obligatorio únicamente cuando alguien va a meter las manos en la máquina.</div>

<h3>B. Paro de emergencia (solo ante peligro)</h3>

<div class="alert-box">⚠ Usa el paro de emergencia solo si hay riesgo para una persona o para el equipo: atrapamiento, atasco grave, golpeteo o ruido anormal fuerte, humo, u olor a quemado. No es el modo normal de terminar un lote.</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Pulsar el paro de emergencia</span></div>
  <div class="step-card__row"><span>Acción</span><span>Golpea el botón de parada de emergencia (seta roja). La máquina se detiene de inmediato.</span></div>
  <div class="step-card__row"><span>Por qué</span><span>Corta el movimiento al instante para proteger a la persona o evitar mayor daño al equipo. El control automatizado también detiene la máquina ante errores o activación de seguridad.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> todo movimiento detenido. No rearmes hasta entender la causa.</div>
</div>

<div class="step-card">
  <div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Identificar y resolver la causa antes de rearmar</span></div>
  <div class="step-card__row"><span>Acción</span><span>Mantén la máquina apagada hasta resolver. Consulta la HMI (muestra síntoma, causa y método de solución). Si la causa es eléctrica, la corrige un electricista cualificado; si es un componente, corrígelo de inmediato. Si vas a intervenir, aplica LOTO (sección A, paso 9).</span></div>
  <div class="step-card__row"><span>Por qué</span><span>No se debe operar con errores o condiciones inadecuadas (manual 2.6.1). Rearmar sin resolver la causa repite el fallo o agrava el daño.</span></div>
  <div class="step-card__params"><strong>Verificar:</strong> causa resuelta y registrada; condiciones seguras antes de rearmar y volver al procedimiento normal. <span class="src-tag src-reco">VALIDAR EN PLANTA</span> El manual no incluye una tabla de códigos de alarma del PLC/HMI; solicitar el listado de alarmas al fabricante.</div>
</div>

<h3>C. Diferencia entre paro normal y paro de emergencia</h3>

<table class="crit-table">
  <tbody>
    <tr><th>Aspecto</th><th>Paro normal de fin de lote</th><th>Paro de emergencia</th></tr>
    <tr><td>Cuándo se usa</td><td>Al terminar el lote, de forma planificada</td><td>Solo ante peligro para persona o equipo</td></tr>
    <tr><td>Cómo se detiene</td><td>Botón Parada (Stop) tras vaciar el circuito</td><td>Botón de parada de emergencia (seta roja), de inmediato</td></tr>
    <tr><td>Estado de la máquina</td><td>Vacía: tolvas vacías, sin cápsulas en proceso</td><td>Se detiene como esté, posiblemente con producto dentro</td></tr>
    <tr><td>Antes de detener</td><td>Se deja de alimentar y se deja vaciar (pasos 1-3)</td><td>No hay preparación: se actúa al instante</td></tr>
    <tr><td>Después</td><td>Limpieza completa y máquina lista para el siguiente lote</td><td>Identificar y resolver la causa antes de rearmar</td></tr>
    <tr><td>LOTO</td><td>Solo si se va a intervenir la máquina</td><td>Aplicar LOTO antes de cualquier intervención por la falla</td></tr>
  </tbody>
</table>

<p><strong>Resultado esperado al cerrar el lote:</strong> máquina detenida con el botón Parada, tolvas vacías, zona de descarga de cápsulas vacías limpia (sin atascos para el siguiente lote), interior limpio solo con aspiradora, filtro/malla del colector limpios si hubo ruido, y consignada con LOTO si quedó pendiente una intervención.</p>
              `
            }
          ],
          systems: [
            { name: "Alimentación de cápsulas", function: "Recibir, ordenar y entregar cápsulas vacías una por una al sistema de moldes.", components: ["Tolva", "Compuerta", "Tubo de cápsulas", "Peine de cápsulas", "Retén de cápsulas"], status: "Base manual consolidada" },
            { name: "Orientación", function: "Alinear cada cápsula con tapa arriba y cuerpo abajo antes del molde.", components: ["Guías", "Peine", "Empujadores", "Canales", "Elementos de ordenamiento"], status: "Base manual consolidada" },
            { name: "Moldes", function: "Sujetar tapa y cuerpo durante el ciclo y permitir separación, llenado y cierre.", components: ["Molde superior", "Molde inferior", "Asientos", "Sello", "Barras de calibración"], status: "Base manual consolidada" },
            { name: "Vacío", function: "Separar tapa y cuerpo mediante bomba SK y asiento de succión regulado.", components: ["Bomba SK", "Asiento de succión", "Tanque", "Válvulas", "Filtros", "Mangueras"], status: "Base manual consolidada", commonFailures: ["No se separan", "Bajo vacío", "Filtros obstruidos", "Fugas", "Holgura fuera de rango"] },
            { name: "Dosificación", function: "Dosificar producto por compactación en disco y punzones.", components: ["Disco dosificador", "Copper pad", "Bloqueador de polvo", "Punzones", "Tolva", "Detector de nivel"], status: "Base manual consolidada" },
            { name: "Rechazo", function: "Retirar cápsulas no separadas o defectuosas antes de descarga.", components: ["Empujador", "Cámara de aire", "Varillas", "Canal de descarte"], status: "Base manual consolidada" },
            { name: "Cierre", function: "Unir tapa y cuerpo lleno hasta longitud final correcta.", components: ["Varilla de cierre", "Guías", "Topes", "Moldes"], status: "Base manual consolidada" },
            { name: "Expulsión", function: "Sacar la cápsula terminada del molde hacia la salida.", components: ["Perno de descarga", "Canal de salida"], status: "Base manual consolidada" },
            { name: "Limpieza de molde", function: "Eliminar polvo residual del alojamiento para evitar fallas de asiento y contaminación.", components: ["Aguja de aire", "Boquilla", "Canales de limpieza"], status: "Base manual consolidada" },
            { name: "Transmisión", function: "Mover torreta y estaciones de forma sincronizada.", components: ["Cadena", "Piñón tensor", "Levas", "Motor principal", "Reductor"], status: "Base manual consolidada" },
            { name: "Colector de polvo", function: "Retirar polvo y cápsulas descartadas desde estaciones de trabajo.", components: ["Aspiradora", "Filtro", "Tuberías", "Depósito"], status: "Base manual consolidada" },
            { name: "Control eléctrico", function: "Gestionar HMI, PLC, variador, sensores y funciones de diálogo de fallas.", components: ["HMI Siemens", "PLC Siemens", "Emerson EV1000", "Sensores", "Relés"], status: "Base manual consolidada" },
            { name: "Seguridad", function: "Proteger al operador mediante guardas, interlocks, alarmas y paro de emergencia.", components: ["Guardas", "Ventanas", "Interlocks", "Paro de emergencia", "Alarmas"], status: "Base manual consolidada" }
          ],
          systemAtlas: {
            title: "Vista general + desglose progresivo por sistemas",
            description: "Esta pestaña convierte el manual en una lectura guiada: primero ves la máquina completa, luego la línea auxiliar y después puedes ir hundiendo por subsistemas con su imagen del manual, piezas clave, ajustes y diagnóstico.",
            machineMap: {
              title: "Vista general tocable de la NJP-3500",
              description: "Puedes tocar zonas de la imagen para saltar directo al sistema correspondiente. Los recuadros son aproximados y están pensados como navegación técnica rápida.",
              image: {
                src: "assets/njp3500_manual_es/pages/vista general njp3500.png",
                alt: "Vista general de la NJP-3500 (traducida)",
                page: 23
              },
              hotspots: [
                { label: "1. Tolva de cápsulas", target: "alimentacion-orientacion", x: 21.79, y: 7.45, w: 3.21, h: 6.21 },
                { label: "2. Alimentación y orientación", target: "alimentacion-orientacion", x: 23.20, y: 31.84, w: 3.21, h: 6.21 },
                { label: "3. Limpieza de moldes", target: "descarga-limpieza", x: 10.62, y: 38.36, w: 3.21, h: 6.21 },
                { label: "4. Salida / descarga", target: "descarga-limpieza", x: 16.40, y: 39.66, w: 3.21, h: 6.21 },
                { label: "5. Cierre de cápsulas", target: "cierre-bloqueo", x: 14.69, y: 43.72, w: 3.21, h: 6.21 },
                { label: "6. Rechazo de cápsulas", target: "rechazo", x: 19.66, y: 50.33, w: 3.21, h: 6.21 },
                { label: "7. Transmisión inferior", target: "transmision", x: 21.02, y: 71.25, w: 3.21, h: 6.21 },
                { label: "8. Alimentación y tolva de polvo", target: "control-polvo", x: 76.57, y: 13.10, w: 3.21, h: 6.21 },
                { label: "9. Pantalla táctil / HMI", target: "hmi-control", x: 77.29, y: 28.99, w: 3.21, h: 6.21 },
                { label: "10. Torreta y moldes", target: "torreta-moldes", x: 83.58, y: 42.50, w: 4.19, h: 6.21 },
                { label: "11. Dosificación y llenado", target: "dosificacion-principal", x: 83.60, y: 48.41, w: 4.19, h: 6.21 }
              ]
            },
            overviewFigures: [],
            systems: [
              {
                id: "arquitectura-general",
                name: "Arquitectura general y mapa de conjuntos",
                kicker: "Visión global",
                station: "Mapa general",
                page: 23,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p14.jpg",
                  alt: "Arquitectura general de la NJP-3500 (traducida)",
                  title: "Mapa principal de subconjuntos",
                  page: 23,
                  caption: "Página 23 del manual traducido al español. Contiene la vista general de la máquina con sus conjuntos principales identificados en español."
                },
                summary: "Esta imagen del manual funciona como plano madre: ubica dónde están los grandes conjuntos antes de entrar al detalle de estaciones, ajustes y fallas.",
                flow: [
                  "Tolva y dispositivo de carga llevan cápsulas vacías hacia la torreta.",
                  "La torreta hace avanzar las estaciones en secuencia intermitente.",
                  "Debajo y alrededor de la torreta conviven separación por vacío, llenado, rechazo, cierre, descarga y limpieza.",
                  "La parte inferior transmite el movimiento mecánico sincronizado."
                ],
                components: ["Tolva de cápsulas", "Dispositivo de carga", "Torreta", "Módulo de llenado", "Sistema de rechazo", "Sistema de cierre", "Sistema de descarga", "Transmisión inferior", "Pantalla táctil"],
                adjustments: ["Usar esta vista como referencia antes de cualquier ajuste mecánico.", "Confirmar qué estaciones actúan arriba y cuáles desde la parte inferior.", "No intervenir transmisión, vacío o dosificación sin ubicar primero el punto exacto en la secuencia."],
                diagnostics: ["Si la falla se mueve entre estaciones, revisar sincronía de torreta/transmisión.", "Si la falla se concentra en una sola función, bajar al subsistema puntual.", "Si hay mezcla de síntomas mecánicos y de control, cruzar esta vista con HMI y layout de auxiliares."]
              },
              {
                id: "alimentacion-orientacion",
                name: "Alimentación, compuerta y orientación de cápsulas",
                kicker: "Entrada de cápsulas",
                station: "Estación 1",
                page: 38,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p22.jpg",
                  alt: "Tolva y compuerta de cápsulas",
                  title: "Tolva, compuerta y zona de descarga",
                  page: 38,
                  caption: "Aquí nace la estabilidad del proceso: si la cápsula entra mal, todo el resto del ciclo se desordena."
                },
                summary: "Este sistema recibe cápsulas vacías, regula cuánta carga cae y las entrega al mecanismo de orientación.",
                flow: ["La cápsula cae desde la tolva hacia la zona de descarga.", "La compuerta define cuánto material llega al punto de trabajo.", "El mecanismo de retención deja pasar una cápsula por ciclo.", "Las guías y el peine preparan la cápsula para que el cuerpo quede abajo y la tapa arriba."],
                components: ["Tolva de cápsulas", "Compuerta o gate", "Tuerca de ajuste", "Tapa transparente", "Tubo de cápsulas", "Peine / comb", "Retén o capsule strip"],
                adjustments: ["La acumulación recomendada en descarga es aprox. 1/2 de la altura total de salida.", "La compuerta regula el caudal; demasiado abierta provoca sobrealimentación.", "El retén debe liberar una sola cápsula por ciclo.", "Después de producir, no dejar cápsulas sobrantes en la zona de descarga."],
                diagnostics: ["Si hay dobles cápsulas, revisar profundidad del retén y exceso de carga en tolva.", "Si faltan cápsulas en molde, revisar compuerta demasiado cerrada u obstrucción en el tubo.", "Si la orientación es errática, revisar guías, peine y limpieza del camino de cápsulas."]
              },
              {
                id: "mecanismo-dispensado",
                name: "Mecanismo de dispensado y peine de cápsulas",
                kicker: "Ordenamiento fino",
                station: "Estación 1",
                page: 43,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p24.jpg",
                  alt: "Gap entre tubo y peine",
                  title: "Tubo de cápsulas vs. peine",
                  page: 43,
                  caption: "La holgura entre la cara A del tubo y la cara B del peine es crítica para ordenar sin roce ni dobles."
                },
                summary: "El tubo, el peine y los tirantes hacen el trabajo fino de entregar cápsulas en el ritmo correcto.",
                flow: ["El tubo baja la cápsula hacia el peine.", "El peine ordena la posición relativa de cada cápsula.", "Los tirantes y el balancín corrigen la geometría del conjunto.", "La cápsula queda lista para pasar al punto de separación."],
                components: ["Tubo de cápsulas", "Peine de cápsulas", "Tirante superior", "Tirante inferior", "Componente deslizante direccional", "Brazo oscilante"],
                adjustments: ["Gap tubo/peine: 2–3 mm.", "El ajuste se corrige variando la longitud del tirante inferior.", "Confirmar movimiento recíproco suave sin roce ni golpe.", "No forzar el conjunto; corregir geometría primero."],
                diagnostics: ["Si las cápsulas se cruzan o rebotan, revisar gap fuera de rango.", "Si el peine marca la cápsula, revisar roce mecánico y suciedad.", "Si hay entrega intermitente, revisar tirantes flojos o desalineados."]
              },
              {
                id: "vacio-separacion",
                name: "Separación por vacío de tapa y cuerpo",
                kicker: "Separación neumática",
                station: "Estación 2",
                page: 50,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p28.jpg",
                  alt: "Sistema de separación por vacío",
                  title: "Asiento de succión y moldes",
                  page: 50,
                  caption: "La figura muestra el asiento de succión bajo el molde y el momento en que el sistema entra en vacío para separar tapa y cuerpo."
                },
                summary: "La NJP-3500 separa la cápsula usando vacío. Si aquí falla, no hay apertura útil ni llenado estable.",
                flow: ["La cápsula llega ya orientada al molde.", "El asiento de succión sube hasta acoplar con el molde.", "El vacío separa tapa y cuerpo.", "La máquina continúa hacia dosificación con el cuerpo abierto listo para llenado."],
                components: ["Asiento de succión", "Soporte", "Guía", "Asiento de resorte", "Resorte de compresión", "Soporte inferior", "Línea de vacío", "Bomba SK"],
                adjustments: ["Gap en reposo entre asiento de succión y molde: 1.8–2.5 mm.", "En trabajo debe entrar completamente al estado de vacío sin fuga.", "La corrección se hace desde el tirante inferior del conjunto.", "Vacío de bomba SK normalmente en 0.02–0.04 MPa."],
                diagnostics: ["Si no separa, revisar vacío real, agua de la bomba y fugas.", "Si rompe cápsulas, revisar exceso de vacío o mala geometría del asiento.", "Si unas separan y otras no, revisar uniformidad del gap y limpieza del molde."]
              },
              {
                id: "torreta-moldes",
                name: "Torreta, moldes y calibración de estaciones",
                kicker: "Base geométrica",
                station: "Torreta",
                page: 55,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p30.jpg",
                  alt: "Calibración de módulos superior e inferior",
                  title: "Módulo superior / inferior de la torreta",
                  page: 55,
                  caption: "La geometría de estos módulos gobierna estabilidad, cierre, descarga y desgaste."
                },
                summary: "Los moldes y la torreta son la referencia mecánica de casi todo el proceso.",
                flow: ["El módulo superior sube y baja en movimiento circular.", "El módulo inferior avanza y retrocede en movimiento circular.", "Ambos sujetan tapa y cuerpo durante apertura, llenado, cierre y descarga.", "La concentricidad define si la cápsula trabaja limpia o se daña."],
                components: ["Módulo superior", "Módulo inferior", "Guide frame assembly", "Soporte de torreta", "Leva ranurada", "Brida", "Casquillo de posicionamiento", "Barras de calibración"],
                adjustments: ["Gap entre módulo superior e inferior: 0.2–0.3 mm.", "Concentricidad con barras de calibración: 0.01–0.02 mm.", "La limpieza del molde puede hacerse sin desmontar la torreta.", "No desarmar sin marcar posición y verificar sincronía después."],
                diagnostics: ["Si hay roce o cápsulas marcadas, revisar gap y concentricidad.", "Si varias estaciones fallan a la vez, sospechar primero geometría de torreta.", "Si el equipo suena pesado al girar manualmente, revisar alineación y contaminación interna."]
              },
              {
                id: "dosificacion-principal",
                name: "Dosificación principal: disco, copper pad y llenado",
                kicker: "Llenado de producto",
                station: "Estación 3",
                page: 61,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p33.jpg",
                  alt: "Gap del disco dosificador",
                  title: "Disco dosificador vs. copper pad",
                  page: 61,
                  caption: "Punto más sensible de la dosificación: la holgura entre disco dosificador y copper pad."
                },
                summary: "Aquí se define el peso del llenado. El manual describe una dosificación por compactación muy sensible a la geometría del conjunto.",
                flow: ["El producto baja desde la tolva al conjunto de dosificación.", "El disco dosificador forma o transporta el volumen útil.", "Los punzones compactan según profundidad regulada.", "El cuerpo de la cápsula recibe el llenado en la estación correspondiente."],
                components: ["Módulo de llenado", "Disco dosificador", "Copper pad", "Conjunto de ajuste de base", "Tornillos de ajuste", "Punzones", "Tolva de polvo"],
                adjustments: ["Holgura disco dosificador / copper pad: 0.05–0.15 mm.", "El ajuste se hace aflojando fijación y nivelando con galga.", "Después del ajuste, girar manualmente para comprobar sensación uniforme.", "Si la holgura cambia por desgaste, la variación de peso aparece rápido."],
                diagnostics: ["Si el peso fluctúa, revisar primero esta holgura y luego la fluidez del polvo.", "Si el giro se siente pesado, revisar paralelismo y suciedad bajo el disco.", "Si hay baja utilización de polvo, revisar asentamiento del conjunto y rascado."]
              },
              {
                id: "control-polvo",
                name: "Control de polvo: bloqueador, detector y densidad",
                kicker: "Estabilidad del llenado",
                station: "Dosificación",
                page: 65,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p36.jpg",
                  alt: "Ajuste del bloqueador de polvo",
                  title: "Bloqueador de polvo sobre el disco",
                  page: 65,
                  caption: "El manual fija la holgura del bloqueador y luego la altura del detector de nivel."
                },
                summary: "No basta con que el disco esté bien: el paso de polvo y el nivel disponible también deben ser estables.",
                flow: ["El bloqueador controla cuánto polvo queda disponible sobre el disco.", "El detector de nivel mantiene una altura operativa razonable.", "La profundidad de punzones define densidad y masa del tapón de polvo.", "El llenado final depende del equilibrio entre estos factores."],
                components: ["Bloqueador de polvo", "Shims de ajuste", "Detector capacitivo de nivel", "Soporte del detector", "Disco dosificador", "Punzones y porta-punzones"],
                adjustments: ["Holgura bloqueador / disco: 0.05–0.1 mm.", "Altura del detector respecto al plano del disco: 18–28 mm.", "La profundidad de punzones se ajusta por estación según tabla del manual.", "No exceder el rango del detector o el control de nivel se vuelve errático."],
                diagnostics: ["Si falta polvo sobre el disco, revisar detector demasiado alto o alimentación deficiente.", "Si se acumula polvo y arrastra material, revisar bloqueador muy abierto.", "Si la densidad del tapón es inconsistente, revisar ajuste de punzones."]
              },
              {
                id: "rechazo",
                name: "Rechazo de cápsulas no separadas",
                kicker: "Descarte controlado",
                station: "Estación 4",
                page: 72,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p39.jpg",
                  alt: "Mecanismo de rechazo",
                  title: "Push handle, cámara de aire y top needle",
                  page: 72,
                  caption: "Conjunto que retira las cápsulas cuyo cap/body no se separó correctamente y las lleva al descarte."
                },
                summary: "El rechazo evita que cápsulas mal separadas continúen hacia cierre y salida.",
                flow: ["La máquina identifica la cápsula no separada en el punto de descarte.", "El mecanismo empuja la cápsula defectuosa fuera del flujo productivo.", "El puerto de succión la conduce al depósito de descarte.", "La torreta continúa con las posiciones sanas."],
                components: ["Top needle", "Push handle", "Guide pillar", "Positioning block", "Lower pull rod", "Air chamber", "Universal joint"],
                adjustments: ["Holgura cámara de vacío / plano superior del módulo inferior: 1,5–2 mm (manual p39), con la varilla de tracción del molde inferior.", "Ajustar con tirante inferior y verificar sincronía real en posición de rechazo.", "Evitar exceso de carrera para no marcar moldes."],
                diagnostics: ["Si rechaza demasiado, revisar vacío, sincronía y holguras del rechazo.", "Si deja pasar cápsulas mal separadas, revisar carrera insuficiente.", "Si golpea o hace ruido, revisar top needle tocando planos del molde."]
              },
              {
                id: "cierre-bloqueo",
                name: "Cierre y bloqueo final de la cápsula",
                kicker: "Bloqueo final",
                station: "Estación 5",
                page: 75,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p40.jpg",
                  alt: "Sistema de cierre de cápsulas",
                  title: "Bloqueo de tapa y cuerpo",
                  page: 75,
                  caption: "La regulación debe equivaler a la longitud final de la cápsula ya bloqueada."
                },
                summary: "Después del llenado, la máquina vuelve a unir tapa y cuerpo. Un cierre mal regulado genera cápsulas abiertas o dañadas.",
                flow: ["El cuerpo lleno llega a la estación de cierre.", "El punzón sube y lleva la cápsula a la posición de bloqueo.", "La distancia al tope superior define la longitud final cerrada.", "La cápsula bloqueada avanza a la estación de descarga."],
                components: ["Módulo superior", "Placa superior", "Guide pillar", "Top needle", "Universal joint", "Lower pull rod", "Tuercas de fijación"],
                adjustments: ["Regular la carrera hasta igualar la longitud final de la cápsula cerrada.", "Usar una cápsula sin bloquear para observar la posición real.", "Ajustar y luego fijar tornillos y tuercas.", "Si cambias formato, volver a verificar longitud final."],
                diagnostics: ["Si salen abiertas, revisar carrera insuficiente.", "Si salen quebradas o marcadas, revisar exceso de cierre o desalineación de moldes.", "Si unas cierran y otras no, cruzar este punto con concentricidad de torreta."]
              },
              {
                id: "descarga-limpieza",
                name: "Descarga de cápsulas y limpieza del molde",
                kicker: "Salida del producto",
                station: "Estaciones 6 y 7",
                page: 78,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p41.jpg",
                  alt: "Descarga de cápsulas terminadas",
                  title: "Expulsión hacia la salida",
                  page: 78,
                  caption: "La descarga debe expulsar la cápsula terminada sin golpear moldes; luego la limpieza prepara el siguiente ciclo."
                },
                summary: "La salida no solo expulsa producto: prepara la siguiente vuelta. Conviene leer descarga y limpieza como un bloque único.",
                flow: ["La cápsula cerrada llega a la posición de expulsión.", "El punzón la eleva por encima del plano del molde y la dirige al canal de salida.", "En el retorno mantiene una distancia de seguridad para no golpear el molde.", "La limpieza posterior elimina restos de polvo del alojamiento."],
                components: ["Punzón de descarga", "Canal de salida", "Guide pillar", "Lower pull rod", "Boquillas o agujas de limpieza", "Circuito de aire o aspiración"],
                adjustments: ["Punzón en subida: 1–2 mm por encima del plano del molde superior.", "En retorno: mantener 1.5–2 mm respecto al plano inferior para evitar choque.", "Verificar que el canal de salida no retenga cápsulas.", "Limpiar agujas y pasos de aire para evitar polvo retenido."],
                diagnostics: ["Si la cápsula no sale, revisar carrera de expulsión y obstrucción del canal.", "Si golpea, revisar retorno demasiado alto o desalineado.", "Si luego del cierre aparecen atascos, revisar limpieza de molde insuficiente."]
              },
              {
                id: "transmision",
                name: "Transmisión mecánica, levas y sincronía",
                kicker: "Movimiento del equipo",
                station: "Base inferior",
                page: 81,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p42.jpg",
                  alt: "Levas de transmisión de la NJP-3500",
                  title: "Levas por función",
                  page: 81,
                  caption: "El manual asocia levas a funciones como alimentación, succión, dosificación, descarga, cierre y rechazo."
                },
                summary: "La transmisión gobierna el orden temporal del proceso. Cuando la máquina pierde sincronía, parece que todo está mal aunque el origen sea un desfase mecánico.",
                flow: ["El motor principal transmite energía al tren mecánico.", "Las levas convierten ese movimiento en acciones por estación.", "La cadena mantiene la relación angular entre subconjuntos.", "Cada estación ejecuta su función en la ventana correcta del ciclo."],
                components: ["Motor principal", "Conjunto de levas", "Cadena de transmisión", "Piñón tensor", "Eje de ajuste", "Tuercas de fijación"],
                adjustments: ["El manual advierte no reajustar levas salvo necesidad real.", "Si la cadena se estira, corregir desde la rueda tensora y fijar tuercas.", "Después de tocar transmisión, girar manualmente 3–5 vueltas.", "No arrancar en producción sin confirmar ausencia de interferencias."],
                diagnostics: ["Si hay desfase entre estaciones, sospechar cadena floja o arrastre corrido.", "Si varias funciones cambian a la vez, revisar transmisión antes que cada estación individual.", "Si apareció la falla después de una intervención mecánica, revisar si tocaron levas indebidamente."]
              },
              {
                id: "vacio-auxiliares",
                name: "Bomba de vacío y auxiliares de línea",
                kicker: "Auxiliar crítico",
                station: "Servicio externo",
                page: 85,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p45.jpg",
                  alt: "Bomba de vacío SK",
                  title: "Vacío SK y control por agua",
                  page: 85,
                  caption: "La bomba SK depende del agua de entrada y del valor leído en el vacuómetro."
                },
                summary: "Muchos problemas de separación se intentan corregir desde la estación, cuando en realidad el origen está en la bomba o en su circuito de agua.",
                flow: ["La bomba SK genera el vacío para ubicar y separar cápsulas.", "La válvula de agua regula el grado de vacío.", "El vacuómetro permite leer el valor operativo.", "El circuito auxiliar devuelve estabilidad a la separación durante producción continua."],
                components: ["Bomba SK de anillo líquido", "Circuito de agua", "Válvula de ingreso de agua", "Vacuómetro", "Mangueras de succión", "Separador aire-agua o filtros"],
                adjustments: ["Rango normal de vacío: 0.02–0.04 MPa.", "La regulación se hace desde la válvula de entrada de agua inferior.", "Verificar nivel, flujo y limpieza del circuito de agua.", "No buscar más vacío del necesario."],
                diagnostics: ["Si el vacío cae, revisar agua, filtros, fugas y mangueras.", "Si separa pero daña cápsulas, revisar exceso de vacío.", "Si el valor oscila, revisar estabilidad del suministro de agua y estanqueidad."]
              },
              {
                id: "aspiracion-polvo",
                name: "Aspiración de polvo y residuos",
                kicker: "Limpieza en proceso",
                station: "Auxiliar de limpieza",
                page: 90,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p48.jpg",
                  alt: "Aspiradora industrial de la línea",
                  title: "Aspiradora / recolector de polvo",
                  page: 90,
                  caption: "Cuando se obstruye, disminuye la succión y aparece ruido anormal."
                },
                summary: "El recolector de polvo retira residuos de estaciones y evita que el polvo vuelva a contaminar moldes, sensores y zonas de cierre.",
                flow: ["Aspira polvo y cápsulas descartadas desde estaciones de trabajo.", "Retiene el material en filtro y depósito.", "Mantiene más limpio el entorno del molde y de la línea.", "Reduce arrastre de polvo a sensores, cierre y descarga."],
                components: ["Filtro", "Depósito", "Botón de limpieza", "Puerto de acceso", "Manguera de succión", "Ventilador o blower"],
                adjustments: ["Limpiar periódicamente la tela filtrante y los conductos.", "Revisar que las mangueras no estén colapsadas u obstruidas.", "Mantener el depósito sin sobrellenado.", "Si cambia el sonido, intervenir antes de que baje la succión."],
                diagnostics: ["Si hay ruido anormal, revisar filtro tapado o ductos bloqueados.", "Si vuelve polvo al área de molde, revisar pérdida de succión real.", "Si la máquina se ensucia rápido, revisar conexiones y frecuencia de limpieza del recolector."]
              },
              {
                id: "hmi-control",
                name: "HMI, PLC y control eléctrico",
                kicker: "Control y diálogo de fallas",
                station: "Control",
                page: 30,
                status: "Manual consolidado",
                figure: {
                  src: "assets/manual_es/manual-es-p71.jpg",
                  alt: "Pantalla HMI Siemens Smart Line",
                  title: "Panel HMI y mandos principales",
                  page: 30,
                  caption: "El manual muestra jogging, subir/bajar tolva, abrir/cerrar cápsula y ventilador principal."
                },
                summary: "El control eléctrico es la capa donde el operador visualiza estados, preajustes y algunos diagnósticos.",
                flow: ["La HMI muestra estado operativo y funciones manuales.", "El PLC coordina la lógica del equipo.", "El variador Emerson regula velocidad de forma continua.", "Las alarmas ayudan a relacionar síntoma con causa probable."],
                components: ["HMI Siemens Smart Line", "PLC Siemens", "Variador Emerson EV1000", "Botones de jogging", "Comandos de subir/bajar tolva", "Comandos de abrir/cerrar cápsula"],
                adjustments: ["Usar modo jogging para observar mecánica antes de intervenir con máquina en producción.", "Verificar coherencia entre velocidad programada y comportamiento real.", "Cruzar alarmas con el subsistema físico correspondiente.", "No usar HMI para compensar fallas mecánicas mal diagnosticadas."],
                diagnostics: ["Si el síntoma no coincide con la pantalla, revisar sensores o entradas.", "Si el arranque es errático, revisar lógica de interlocks y estado del variador.", "Si un ajuste mejora solo temporalmente desde HMI, buscar la causa mecánica de fondo."]
              }
            ]
          },
          spareParts: [
            { name: "Pantalla táctil HMI", system: "Eléctrico", type: "Electrónico", criticality: "Alta", reference: "SMART1000IE V3 · 10 pulg. (Siemens)", function: "Interfaz hombre-máquina; muestra estado, fallas, causas y soluciones." },
            { name: "PLC (controlador lógico)", system: "Eléctrico", type: "Electrónico", criticality: "Alta", reference: "Siemens CPU222 (8E/6S)", function: "Cerebro de control de la máquina." },
            { name: "Módulo de expansión PLC", system: "Eléctrico", type: "Electrónico", criticality: "Media", reference: "Siemens Em232", function: "Expansión de entradas/salidas del PLC." },
            { name: "Batería de respaldo del PLC", system: "Eléctrico", type: "Consumible", criticality: "Alta", reference: "Cambiar cada 12 meses", function: "Mantiene la memoria del PLC." },
            { name: "Fuente conmutada 24 VDC", system: "Eléctrico", type: "Electrónico", criticality: "Alta", reference: "S-35-24 · 24VDC 35W (Ming Wei)", function: "Alimentación de control 24 VDC." },
            { name: "Variador de frecuencia", system: "Eléctrico", type: "Electrónico", criticality: "Alta", reference: "Emerson EV1000", function: "Regula la velocidad del motor principal." },
            { name: "Contactor AC", system: "Eléctrico", type: "Electromecánico", criticality: "Media", reference: "Siemens 3TB41 / 3TB43 (x2)", function: "Maniobra de motores." },
            { name: "Relé intermedio", system: "Eléctrico", type: "Electromecánico", criticality: "Media", reference: "Omron MY4NJ (x6)", function: "Relé auxiliar de control." },
            { name: "Interruptor magnetotérmico", system: "Eléctrico", type: "Protección", criticality: "Media", reference: "CHNT DZ47-60-C32 / C5", function: "Protección de circuitos." },
            { name: "Cortacircuito de protección", system: "Eléctrico", type: "Protección", criticality: "Media", reference: "Siemens 11E 3VE1 (x3)", function: "Protección contra sobrecorriente." },
            { name: "Fusible", system: "Eléctrico", type: "Consumible", criticality: "Alta", reference: "Específico del fabricante (no puentear)", function: "Protección eléctrica; usar siempre el fusible especificado." },
            { name: "Sensor de nivel de material", system: "Eléctrico", type: "Sensor", criticality: "Media", reference: "Omron E2K-C25ME1", function: "Detecta el nivel de polvo/material." },
            { name: "Motor principal", system: "Transmisión", type: "Electromecánico", criticality: "Alta", reference: "SEW R57DR S112M4/2W (Alemania)", function: "Acciona la torreta y los mecanismos." },
            { name: "Caja de levas de precisión", system: "Transmisión", type: "Mecánico", criticality: "Alta", reference: "RU180DF-12-150 / RU140DF-6-120", function: "Genera el movimiento intermitente de dosificación." },
            { name: "Juego de 6 levas de sincronización", system: "Transmisión", type: "Mecánico", criticality: "Alta", reference: "Levas 1–6 (alimentación, admisión, dosificación, descargas, cierre, residuos)", function: "Sincroniza todas las fases del ciclo." },
            { name: "Cadena de transmisión y piñón tensor", system: "Transmisión", type: "Mecánico", criticality: "Alta", reference: "—", function: "Transmite el movimiento del motor; tensado regulable." },
            { name: "Correa de distribución", system: "Transmisión", type: "Consumible", criticality: "Alta", reference: "—", function: "Transmisión sincronizada; revisar tensión y estado." },
            { name: "Bomba de vacío de anillo de agua", system: "Vacío", type: "Mecánico", criticality: "Alta", reference: "Serie SK (Zhejiang Xinhuan)", function: "Genera el vacío para abrir y separar las cápsulas." },
            { name: "Filtro de vacío", system: "Vacío", type: "Consumible", criticality: "Muy alta", reference: "—", function: "Protege la bomba contra el polvo." },
            { name: "Junta / sello de vacío", system: "Vacío", type: "Sello", criticality: "Alta", reference: "—", function: "Estanqueidad del circuito de vacío." },
            { name: "Manguera de vacío", system: "Vacío", type: "Neumático", criticality: "Alta", reference: "—", function: "Conduce el vacío a las estaciones." },
            { name: "Manómetro de vacío", system: "Vacío", type: "Instrumento", criticality: "Media", reference: "—", function: "Lectura del nivel de vacío (0,02–0,04 MPa)." },
            { name: "Válvula de entrada de agua", system: "Vacío", type: "Mecánico", criticality: "Media", reference: "—", function: "Regula el nivel de vacío admitiendo agua." },
            { name: "Válvula solenoide", system: "Vacío", type: "Electromecánico", criticality: "Media", reference: "—", function: "Control eléctrico del circuito de vacío." },
            { name: "Válvula cheque (anti-retorno)", system: "Vacío", type: "Mecánico", criticality: "Media", reference: "—", function: "Evita el retorno de agua/aire en el circuito." },
            { name: "Asiento de succión", system: "Vacío", type: "Mecánico", criticality: "Alta", reference: "Holgura 1,8–2,5 mm", function: "Aplica vacío a cada cápsula para abrirla." },
            { name: "Disco / plato dosificador", system: "Dosificación", type: "Mecánico", criticality: "Muy alta", reference: "—", function: "Dosifica el volumen exacto de polvo." },
            { name: "Varillas de llenado / punzones", system: "Dosificación", type: "Desgaste", criticality: "Muy alta", reference: "Profundidad 6/4/3/2/0,5 mm por estación", function: "Compactan el polvo dentro de la cápsula." },
            { name: "Almohadilla de cobre (copper pad)", system: "Dosificación", type: "Mecánico", criticality: "Muy alta", reference: "Holgura 0,05–0,15 mm con el disco", function: "Mantiene la holgura crítica de dosificación." },
            { name: "Bloque y raspador de polvo", system: "Dosificación", type: "Mecánico", criticality: "Alta", reference: "Holgura raspador 0,05–0,1 mm", function: "Controla y raspa el polvo sobre el disco." },
            { name: "Anillo de sellado y de almacenaje de polvo", system: "Dosificación", type: "Sello", criticality: "Alta", reference: "—", function: "Sella y retiene el polvo en el módulo de llenado." },
            { name: "Detector capacitivo de nivel de polvo", system: "Dosificación", type: "Sensor", criticality: "Media", reference: "Soporte M6 · altura 18–28 mm", function: "Vigila el nivel de polvo en la tolva." },
            { name: "Molde / módulo superior", system: "Moldes", type: "Mecánico", criticality: "Muy alta", reference: "Conjunto izq./der. NO intercambiable", function: "Retiene la tapa de la cápsula." },
            { name: "Molde / módulo inferior", system: "Moldes", type: "Mecánico", criticality: "Muy alta", reference: "Conjunto izq./der. NO intercambiable", function: "Retiene el cuerpo de la cápsula." },
            { name: "Barras / pines de calibración", system: "Moldes", type: "Herramental", criticality: "Alta", reference: "Concentricidad 0,01–0,02 mm", function: "Centrado y alineación de moldes y estaciones." },
            { name: "Aguja de limpieza de molde", system: "Moldes", type: "Consumible", criticality: "Alta", reference: "—", function: "Inyecta aire para limpiar el alojamiento del molde." },
            { name: "Rodamiento lineal de estación", system: "Rodamientos", type: "Rodamiento", criticality: "Media", reference: "zxl 16·26·36 (x96)", function: "Guía lineal de las estaciones de trabajo." },
            { name: "Rodamiento de bolas de estación", system: "Rodamientos", type: "Rodamiento", criticality: "Media", reference: "6302 · d15 D42 B13 (x12)", function: "Soporte de eje de estación." },
            { name: "Seguidor de leva (estación)", system: "Rodamientos", type: "Rodamiento", criticality: "Media", reference: "CF-6 (x12)", function: "Seguidor de leva de estación." },
            { name: "Rodamientos sección cápsulas", system: "Rodamientos", type: "Rodamiento", criticality: "Media", reference: "625 / 626 / 608 / 6004", function: "Soporte de ejes de la sección de cápsulas." },
            { name: "Rodamiento lineal columnas de llenado", system: "Rodamientos", type: "Rodamiento", criticality: "Media", reference: "zxl 50·80·100 (x4)", function: "Guía de las columnas de llenado." },
            { name: "Rodamientos de transmisión", system: "Rodamientos", type: "Rodamiento", criticality: "Media", reference: "zxt 25·40·58 / 1309 / 1507 / CF-18 / 62200-2RS / NA4905", function: "Soporte y guía del mecanismo de transmisión." },
            { name: "Colector de polvo / aspiradora", system: "Otros", type: "Mecánico", criticality: "Alta", reference: "EDC series (Kaixinlong)", function: "Aspira el polvo del proceso y las cápsulas de desecho." },
            { name: "Malla / filtro del colector", system: "Otros", type: "Consumible", criticality: "Alta", reference: "—", function: "Filtra el polvo aspirado; limpiar periódicamente." },
            { name: "Lubricantes (set)", system: "Otros", type: "Consumible", criticality: "Media", reference: "STABYL 300 AL2 · Fuchs GERALYN 1 · N4B GB443-84 · ZL2/ZLD SY1412-75", function: "Lubricación de levas, guías, cadena, rodamientos y reductor." }
          ],
          maintenanceTasks: [
            { name: "Limpieza: retirar restos y limpiar la cubierta protectora (solo aspiradora)", system: "Limpieza", frequency: "Diario", type: "Limpieza", acceptance: "Sin restos; usar únicamente aspiradora (manual)." },
            { name: "Inspección visual general y verificación del nivel de vacío en el manómetro", system: "General", frequency: "Diario", type: "Inspección", acceptance: "Vacío 0,02–0,04 MPa; sin fugas, ruidos ni alarmas." },
            { name: "Limpieza de sensores con paño suave sin pelusa", system: "Control", frequency: "Diario", type: "Limpieza", acceptance: "Lectura estable, sin residuos." },
            { name: "Limpiar la zona de descarga de cápsulas vacías al terminar", system: "Alimentación", frequency: "Diario", type: "Limpieza", acceptance: "Sin atascos para el siguiente lote." },
            { name: "Limpieza a fondo de moldes y estaciones (solo aspiradora)", system: "Moldes", frequency: "Semanal", type: "Limpieza", acceptance: "Sin polvo ni residuos." },
            { name: "Revisar mangueras, racores y fugas de vacío/aire", system: "Neumática", frequency: "Semanal", type: "Inspección", acceptance: "Sin fugas; conexiones firmes." },
            { name: "Inspeccionar filtro/malla del colector de polvo y tubo de succión", system: "Aspiración", frequency: "Semanal", type: "Limpieza", acceptance: "Sin obstrucción; sin ruido anormal de la aspiradora." },
            { name: "Lubricar bloqueos de torque de estaciones (rechazo, cierre, dispensación)", system: "Lubricación", frequency: "Semanal", type: "Lubricación", acceptance: "STABYL 300 AL 2; movimiento suave." },
            { name: "Comprobar fijaciones: pernos, tornillos, tuercas y autoblocantes", system: "Estructura", frequency: "Mensual", type: "Inspección", acceptance: "Sin aflojamiento ni desprendimiento." },
            { name: "Revisar tensión y estado de la correa de distribución y la cadena", system: "Transmisión", frequency: "Mensual", type: "Inspección", acceptance: "Bien tensada y sin daños." },
            { name: "Limpiar filtro de vacío, reemplazarlo y limpiar el interruptor de presión", system: "Vacío", frequency: "Mensual", type: "Reemplazo", acceptance: "Filtro limpio; sin fugas." },
            { name: "Probar el interruptor de la puerta (enclavamiento de seguridad)", system: "Seguridad", frequency: "Mensual", type: "Inspección", acceptance: "Parada automática al abrir la guarda." },
            { name: "Comprobar equipos eléctricos sin daños (con LOTO, máquina sin tensión)", system: "Eléctrico", frequency: "Mensual", type: "Inspección", acceptance: "Sin daños; intervención sin tensión." },
            { name: "Lubricar leva radial (STABYL 300 AL2) y riel guía / propulsor (Fuchs GERALYN 1)", system: "Lubricación", frequency: "Mensual", type: "Lubricación", acceptance: "1–2 disparos por punto." },
            { name: "Comprobar y rellenar el aceite del reductor", system: "Reductor", frequency: "Trimestral", type: "Inspección", acceptance: "Nivel correcto (aceite según fabricante del reductor)." },
            { name: "Lubricación general (Tabla 4.1): cadena, rodamientos, levas, caja de distribución", system: "Lubricación", frequency: "Trimestral", type: "Lubricación", acceptance: "N4B GB443-84 · ZL2/ZLD SY1412-75 aplicados." },
            { name: "Verificar holguras de dosificación: disco–almohadilla y raspador de polvo", system: "Dosificación", frequency: "Trimestral", type: "Ajuste", acceptance: "0,05–0,15 mm y 0,05–0,1 mm." },
            { name: "Verificar vacío, holgura del asiento de succión y altura del detector de polvo", system: "Vacío", frequency: "Trimestral", type: "Ajuste", acceptance: "Asiento 1,8–2,5 mm; detector 18–28 mm." },
            { name: "Calibrar moldes: concentricidad de orificios y separación entre módulos", system: "Moldes", frequency: "Semestral", type: "Ajuste", acceptance: "Concentricidad 0,01–0,02 mm; separación 0,2–0,3 mm." },
            { name: "Revisar rodamientos por zona (Tabla 4.3) y reemplazar los desgastados", system: "Rodamientos", frequency: "Semestral", type: "Reemplazo", acceptance: "Sin juego ni ruido." },
            { name: "Revisar punzones y disco dosificador por desgaste", system: "Dosificación", frequency: "Semestral", type: "Inspección", acceptance: "Dosis estable; sin marcas ni mellas." },
            { name: "Cambiar el aceite del reductor", system: "Reductor", frequency: "Semestral", type: "Reemplazo", acceptance: "Aceite renovado según fabricante." },
            { name: "Sustituir la batería de respaldo del PLC", system: "Control", frequency: "Anual", type: "Reemplazo", acceptance: "Cada 12 meses (indicado por el manual)." },
            { name: "Inspección profesional de seguridad y del sistema de eliminación de sustancias peligrosas", system: "Seguridad", frequency: "Anual", type: "Inspección", acceptance: "Verificado y registrado en certificado (manual)." }
          ],
          failureModes: [
            {
              name: "Cápsulas no se separan", probableSystem: "Vacío / Alimentación", status: "Base manual consolidada",
              symptoms: ["Sin abrir", "Paradas", "Sin llenar"],
              checks: ["Vacío", "Asiento de succión 1.8–2.5 mm", "Filtros", "Mangueras", "Agua de bomba SK"],
              correction: "Limpiar filtros de succión, ajustar asiento a 1.8–2.5 mm, verificar nivel de agua en bomba SK.",
              steps: [
                { title: "Nivel de agua en bomba SK", where: "Visor lateral de la bomba de vacío SK (bomba de anillo líquido), al costado de la máquina.", how: "Mira el visor de vidrio: el agua debe llegar entre las marcas MIN y MAX. Si está por debajo de MIN, agrega agua destilada o de red limpia hasta MAX.", spec: "Entre marcas MIN–MAX del visor", tool: null, ifFail: "Sin agua la bomba cavita, no genera vacío y suena distinto (golpeteo o chirrido). Llena hasta MAX y reinicia. Si pierde nivel constantemente, verificar sello mecánico de la bomba." },
                { title: "Filtros de succión", where: "Líneas de vacío entre la torreta y la bomba SK: hay un bloque-filtro metálico lateral y filtros en las mangueras de unión.", how: "Para la máquina. Desconecta la manguera de entrada del filtro. Extrae el elemento filtrante (malla o cartucho). Sopla con aire comprimido de planta. Revisa la malla: si está negra, apelmazada o rota, reemplaza.", spec: null, tool: "Compresor de aire, llave de tubo o llave fija", ifFail: "Filtro obstruido baja el vacío por debajo del rango operativo de 0,02–0,04 MPa (20–40 kPa) — insuficiente para separar la cápsula. Limpiar o cambiar el elemento filtrante." },
                { title: "Altura del asiento de succión", where: "Cabezal de vacío sobre el molde superior. El asiento es la pieza cilíndrica que baja a tocar el molde para aplicar vacío a cada cápsula.", how: "Con la máquina parada, gira lentamente con la manivela hasta que el cabezal esté en posición de trabajo (asiento hacia abajo). Mide con calibrador la distancia entre la base del asiento y la superficie del molde inferior.", spec: "1.8–2.5 mm", tool: "Calibrador vernier (pie de rey)", ifFail: "< 1.8 mm: roza el molde, genera desgaste y ruido. > 2.5 mm: el vacío se rompe y la cápsula no abre. Ajustar con el tornillo de regulación de altura (llave hex 4 mm), ¼ vuelta a la vez. Re-verificar con calibrador." },
                { title: "Mangueras de vacío", where: "Recorrido completo desde la bomba SK hasta los cabezales en la torreta.", how: "Recorre cada tramo con la mano mientras la bomba corre. Busca: dobleces (la manguera no debe doblarse a menos de 5 cm de radio), grietas en dobleces y uniones, abrazaderas flojas. Aprieta abrazaderas con destornillador.", spec: null, tool: "Destornillador plano", ifFail: "Una fuga pequeña baja el vacío por debajo de 0,02 MPa (20 kPa), fuera del rango operativo. Reemplaza el tramo afectado con la misma sección nominal de manguera." }
              ]
            },
            {
              name: "Variación de peso", probableSystem: "Dosificación", status: "Base manual consolidada",
              symptoms: ["Peso fuera de rango", "Rechazos"],
              checks: ["Fluidez/humedad polvo", "Disco 0.05–0.15 mm", "Bloqueador 0.05–0.1 mm", "Detector 18–28 mm", "Punzones"],
              correction: "Controlar humedad del producto, regular holgura del disco a 0.05–0.15 mm y calibrar copper pad.",
              steps: [
                { title: "Fluidez y humedad del producto", where: "Tolva de producto y muestra tomada directamente.", how: "Toma un puñado de polvo y presiona en la palma. Si forma grumos que no caen solos al abrir la mano, hay exceso de humedad. Intenta verter el polvo en un embudo angosto: si fluye libremente, OK; si se atasca, está húmedo o con finos.", spec: "Polvo libre, sin grumos, sin adherencia en la mano", tool: null, ifFail: "Producto húmedo produce variaciones de ±20 % o más. Secar en horno de bandeja o con flujo de aire seco y re-tamizar antes de cargar. No continuar producción con polvo fuera de especificación." },
                { title: "Holgura del disco dosificador", where: "Módulo de llenado, disco dosificador metálico circular sobre la tolva de producto.", how: "Retira el módulo de llenado verticalmente (no inclinar). Con el disco montado en posición de trabajo, introduce la galga de espesores por el borde exterior entre el disco y el cuerpo fijo. Prueba con galgas sucesivas hasta encontrar la que pasa con leve resistencia.", spec: "0.05–0.15 mm", tool: "Galga de espesores (feeler gauge)", ifFail: "< 0.05 mm: disco roza → se atasca o se desgasta rápido. > 0.15 mm: polvo fluye en exceso → peso sube. Ajusta el tope del disco o añade calzas según el manual." },
                { title: "Holgura del bloqueador de polvo (powder blocker)", where: "Módulo de llenado, pieza que cierra la cavidad dosificadora mientras el disco gira.", how: "Con el módulo en posición de trabajo, introduce la galga entre el bloqueador y la cara superior del disco.", spec: "0.05–0.1 mm", tool: "Galga de espesores", ifFail: "Holgura mayor permite que el polvo fluya fuera del ciclo de dosificación → variación de peso. Ajusta la posición del bloqueador con su tornillo de fijación (no toques el tornillo sin marcar primero la posición original)." },
                { title: "Posición del detector de nivel de polvo", where: "Sensor Omron E2K-C25ME1 montado en la pared lateral de la tolva de producto.", how: "Mide con regla la distancia entre la cara activa del sensor (cara plana marcada) y la superficie del polvo (o la pared de referencia si la tolva está vacía). Ajusta deslizando la abrazadera del sensor por la ranura.", spec: "18–28 mm desde la cara sensora", tool: "Regla o calibrador", ifFail: "> 28 mm: el sensor no detecta nivel bajo → tolva se vacía → cápsulas sin llenar. < 18 mm: el sensor activa constantemente o el polvo tapa la cara activa." },
                { title: "Estado de los punzones", where: "Módulo de llenado, punzones verticales que compactan el polvo en las cavidades del disco.", how: "Retira los punzones del módulo (son extraíbles hacia arriba). Inspecciona la punta: debe ser plana, lisa, sin mellas ni desgaste cónico. Si sospechas desgaste dimensional, mide el diámetro con micrómetro.", spec: "Punta plana, sin mellas; diámetro dentro del nominal del formato instalado", tool: "Micrómetro exterior", ifFail: "Punzones desgastados no compactan uniformemente → peso inconsistente. Reemplazar el set completo (no mezclar un punzón nuevo con usados)." }
              ]
            },
            {
              name: "Cápsulas rotas o roce", probableSystem: "Cierre / Moldes", status: "Base manual consolidada",
              symptoms: ["Dañadas a la salida", "Ruido", "Marcas"],
              checks: ["Alineación moldes", "Concentricidad 0.01–0.02 mm", "Altura cierre", "Calidad cápsulas"],
              correction: "Alinear moldes superior/inferior para lograr concentricidad de 0.01–0.02 mm y regular altura de cierre.",
              steps: [
                { title: "Calidad de las cápsulas de entrada", where: "Tolva de alimentación de cápsulas.", how: "Toma 10 cápsulas al azar. Revisa cada una: ¿hay aplastadas, con rebabas, con diferencia de color, o más duras de lo normal al apretar? Mide el diámetro externo de la tapa con micrómetro y compara con el nominal de la talla.", spec: "Sin deformaciones; diámetro dentro de ±0.05 mm del nominal de la talla", tool: "Micrómetro exterior", ifFail: "Cápsulas defectuosas se rompen en el cierre independientemente del ajuste de la máquina. Cambiar de lote. No mezclar tallas ni lotes distintos." },
                { title: "Concentricidad de moldes superior e inferior", where: "Torreta de moldes: el molde superior retiene la tapa y el molde inferior retiene el cuerpo.", how: "Inserta las 2 barras de calibración del herramental en los alojamientos del molde. Gira la torreta manualmente despacio, 3–5 vueltas completas. No debe haber fricción ni ruido seco. Si hay resistencia, apoya el comparador de carátula en las barras y lee la oscilación al girar.", spec: "Oscilación máxima 0.01–0.02 mm", tool: "Barras de calibración del herramental + comparador de carátula", ifFail: "> 0.02 mm: afloja los tornillos de fijación del molde superior, centra usando las barras como referencia, aprieta en cruz (no en secuencia circular) y repite la medición." },
                { title: "Altura de cierre", where: "Zona de cierre de la torreta, varilla de cierre y guías en la última estación antes de la salida.", how: "Corre la máquina lentamente con la manivela hasta la zona de cierre. Observa que la varilla empuje la tapa hacia el cuerpo en una sola acción suave. Luego toma una cápsula cerrada de la salida y mide la longitud total con calibrador.", spec: "El manual NO da tabla por talla: mide una cápsula de TU talla ya cerrada y calibra a esa longitud exacta", tool: "Calibrador vernier", ifFail: "Cápsula más larga que el nominal → cierre incompleto, la tapa puede soltarse en empaque. Más corta → exceso de presión aplasta la tapa. Ajustar el tope de altura de la varilla de cierre media vuelta a la vez." }
              ]
            },
            {
              name: "Rechazo excesivo", probableSystem: "Rechazo / Vacío", status: "Base manual consolidada",
              symptoms: ["Muchas cápsulas al descarte"],
              checks: ["Sincronía expulsor", "Nivel de vacío", "Holgura cámara de vacío vs módulo inferior 1,5–2 mm", "Posicionamiento"],
              correction: "Comprobar sincronía del expulsor neumático, reajustar varillas de rechazo y verificar vacío.",
              steps: [
                { title: "Sincronía del expulsor de rechazo", where: "Zona de rechazo, entre estación de dosificación y cierre.", how: "Corre la máquina muy lento con la manivela. Observa el ciclo del expulsor: debe actuar exactamente cuando la cápsula sin separar llega al punto de rechazo. Si actúa antes o después, ajusta el temporizador del solenoide o mueve la leva de activación según el diagrama de tiempos del manual.", spec: "Acción del expulsor coincide ±1 posición de torreta con la cápsula defectuosa", tool: null, ifFail: "Desincronizado temprano: rechaza cápsulas buenas. Desincronizado tarde: la cápsula mala pasa a llenado → contaminación y atascos. Ajustar el temporizador del solenoide en pasos pequeños (el manual no da el valor exacto)." },
                { title: "Holgura cámara de vacío vs módulo inferior", where: "Estación de rechazo: entre el plano inferior de la cámara de vacío y el plano superior del módulo inferior.", how: "Con la máquina parada, introduce la galga de espesores entre el plano inferior de la cámara de vacío y el plano superior del módulo inferior; ajusta con la varilla de tracción del molde inferior.", spec: "1,5–2 mm (única holgura que da el manual, p39)", tool: "Galga de espesores", ifFail: "Fuera de 1,5–2 mm el rechazo desalinea o no actúa bien. Ajustar con la varilla de tracción del molde inferior." }
              ]
            },
            {
              name: "Atascos en molde", probableSystem: "Limpieza / Moldes", status: "Base manual consolidada",
              symptoms: ["Paradas por atasco", "Ruido en torreta"],
              checks: ["Aguja limpieza activa", "Polvo acumulado", "Desgaste moldes", "Presión aire"],
              correction: "Verificar aguja de limpieza activa, remover residuos y chequear presión de aire de limpieza.",
              steps: [
                { title: "Presión de aire de la aguja de limpieza", where: "Aguja de limpieza de moldes (pieza con boquilla de aire entre la estación de descarga y la de alimentación en la torreta).", how: "Verifica el manómetro de la línea de aire de la máquina. Desconecta la línea de la aguja y aplica aire manualmente — debe salir un chorro seco y fuerte.", spec: "El manual no especifica la presión de aire: valida la de tu red en planta. Debe salir un chorro seco y fuerte, sin agua ni aceite", tool: "Manómetro de línea", ifFail: "Sin aire suficiente: el polvo no se expulsa del alojamiento y la cápsula siguiente no asienta. Verificar filtro-regulador-lubricador (unidad de mantenimiento): purgar agua, limpiar filtro y regular a una presión estable (valor a validar en planta)." },
                { title: "Residuos en alojamientos del molde", where: "Interior de los alojamientos del molde superior e inferior en toda la torreta.", how: "Para la máquina. Retira los moldes de 3 estaciones al azar. Con luz y lupa si es necesario, inspecciona el fondo del alojamiento. Limpia con brocha seca y aire comprimido a 4–5 bar. Si hay polvo húmedo adherido, usa hisopo de alcohol isopropílico.", spec: "Interior limpio y seco, sin residuos visibles", tool: "Brocha, compresor, hisopo de alcohol isopropílico", ifFail: "Polvo compactado en el fondo impide que la cápsula asiente y la máquina para o rompe la cápsula. Si toda la torreta está contaminada, programar limpieza completa por estación." },
                { title: "Desgaste del alojamiento del molde", where: "Diámetro interno del alojamiento en el molde superior e inferior.", how: "Mide el diámetro interno del alojamiento con calibre de interiores o calibre tipo pasador. Compara con el diámetro nominal de la cápsula del tamaño que estás corriendo.", spec: "El manual no especifica esta holgura; el alojamiento desgastado deja la cápsula floja respecto al diámetro nominal de su talla", tool: "Calibre de interiores o juego de pasadores de verificación", ifFail: "Alojamiento agrandado por desgaste: la cápsula baila → desalineación → atasco. Holgura negativa (la cápsula no entra): molde comprimido o contaminado. Reemplazar el molde desgastado." }
              ]
            },
            {
              name: "Ruido anormal en aspiradora", probableSystem: "Colector de polvo", status: "Base manual consolidada",
              symptoms: ["Ruido inusual", "Menor succión en máquina"],
              checks: ["Filtro de mangas", "Tela filtrante", "Ductos de aspiración"],
              correction: "Limpiar o sacudir el filtro de mangas, revisar hermeticidad de ductos y estado del extractor.",
              steps: [
                { title: "Filtro de mangas / tela filtrante", where: "Colector de polvo conectado a la máquina (aspiradora industrial).", how: "Para la máquina. Abre el colector. Extrae el filtro de mangas o cartucho filtrante. Golpea suavemente contra una superficie y observa cuánto polvo cae. Si la tela está rota, tiene agujeros o está húmeda y apelmazada, reemplaza.", spec: "Sin roturas; polvo suelto (no adherido permanentemente)", tool: null, ifFail: "Filtro saturado: la succión baja y el polvo vuelve a la máquina contaminando el producto. Limpiar con aire comprimido o reemplazar. Establecer limpieza periódica cada 8 horas de producción." },
                { title: "Hermeticidad de ductos y uniones", where: "Toda la tubería de aspiración que conecta los puntos de extracción de la máquina al colector.", how: "Enciende solo el colector (sin la máquina). Pasa la mano lentamente por cada unión, mangote y abrazadera. Una fuga se siente como aire que sopla hacia afuera (la zona antes del filtro está en presión negativa, pero en las fugas grandes puede haber turbulencia audible). Aprieta abrazaderas.", spec: null, tool: "Destornillador", ifFail: "Fugas reducen la succión efectiva en los puntos de extracción y generan ruido de turbulencia. Sellar con cinta de ducto o reemplazar el tramo de manguera afectado." }
              ]
            }
          ],
          documents: [
            { name: "Ficha técnica fabricante (CFK-3500C)", status: "Disponible", file: "manuales/njp3500/NJP3500-ficha-tecnica-es.pdf" },
            { name: "Manual del fabricante (OCR consolidado)", status: "Disponible", file: "manuales/njp3500/NJP3500-manual-fabricante.pdf" },
            { name: "Resumen técnico del manual", status: "Disponible", file: "manuales/njp3500/NJP3500-manual-fabricante.pdf" },
            { name: "Placa técnica del equipo", status: "Pendiente" },
            { name: "Plano eléctrico", status: "Pendiente" },
            { name: "Plano neumático", status: "Pendiente" },
            { name: "Fotos del equipo instalado", status: "Pendiente" },
            { name: "Lista de repuestos originales", status: "Pendiente" },
            { name: "Programa de mantenimiento", status: "Pendiente" }
          ]
        },
{
          id: "controlsa114rl",
          equipoCod: "114RL",
          name: "Puerta rápida autorreparable de laboratorio CONTROLSA",
          model: "114 RL",
          current: "Equipo nuevo",
          area: "Sede 4 · Accesos / Laboratorio",
          location: "Sede 4 · Ubicación por confirmar",
          status: "Documentado por manual",
          criticality: "Alta",
          manual: "Manual de usuario original disponible",
          maintenance: "Plan anual + trimestral definido por manual",
          completion: 90,
          image: "controlsa114rl.png",
          notes: "Manual original REF MM-114RLAEP0V03. Ficha técnica comercial 114RL006. Confirmar dimensiones y configuración exacta del equipo instalado.",
          searchAliases: ["estela", "puerta estela", "controlsa estela", "114 rl estela"],
          description:
            "Puerta rápida enrollable autorreparable para áreas interiores de laboratorio. Diseñada para accesos rápidos, conservación del aire y separación de áreas, con sistema patentado que permite que la lona salga de guías ante impacto y se reinserte automáticamente al subir.",
          technicalData: {
            function: "Controlar acceso rápido y seguro entre áreas interiores, con apertura/cierre motorizado, reinserción automática de lona, barrera de seguridad y control electrónico integrado.",
            capacity: "Hasta 1 m/s apertura · 0,6 m/s cierre",
            capsuleSizes: "Paso máximo A=3000 × H=3500 mm",
            dosingSystem: "Motorización con correa + tambor enrollable + cuadro electrónico con variador y autómata",
            manufacturer: "CONTROLSA, S.A.",
            brand: "Autorreparable® de Laboratorio",
            serialNumber: "Por confirmar en placa",
            year: "Manual 2024 / equipo por confirmar",
            voltage: "230 VAC monofásica (manual) / 220-240 VAC 50-60 Hz (ficha)",
            power: "0,40–0,55 kW",
            weight: "No indicado en manual disponible",
            dimensions: "Máx. A=3000 × H=3500 mm"
          },
          summarySpecs: [
            { label: "Velocidad apertura", value: "Hasta 1 m/s" },
            { label: "Velocidad cierre", value: "0,6 m/s" },
            { label: "Paso máximo", value: "3000 × 3500 mm" },
            { label: "Alimentación", value: "230 VAC monofásica / 220-240 VAC 50-60 Hz" },
            { label: "Potencia", value: "0,40–0,55 kW" },
            { label: "Durabilidad", value: "250.000 ciclos" }
          ],
          guideSections: [
            {
              id: "controlsa-id-general",
              title: "Identificación general",
              content: `
                <div class="guide-media">
                  <div class="guide-media__img">
                    <img src="controlsa114rl.png" alt="Puerta rápida autorreparable 114 RL" />
                  </div>
                  <div class="guide-media__body">
                    <p><strong>Equipo:</strong> Puerta rápida enrollable autorreparable de laboratorio</p>
                    <p><strong>Modelo / familia:</strong> 114 RL</p>
                    <p><strong>Fabricante:</strong> CONTROLSA, S.A.</p>
                    <p><strong>Marca / línea:</strong> Autorreparable® de Laboratorio</p>
                    <p><strong>Uso:</strong> accesos y separación de áreas interiores con exigencia de limpieza y conservación del aire</p>
                    <p><strong>Estado documental:</strong> consolidado desde manual de usuario y ficha técnica comercial del fabricante</p>
                  </div>
                </div>
              `
            },
            {
              id: "controlsa-parametros",
              title: "Parámetros técnicos confirmados",
              content: `
                <div class="guide-media">
                  <div class="guide-media__img">
                    <img src="controlsa114rl-manual.png" alt="Manual Controlsa 114 RL" />
                  </div>
                  <div class="guide-media__body">
                    <p>Esta ficha separa lo <strong>confirmado por manual</strong> de lo tomado desde la <strong>ficha técnica comercial</strong>. Si aparece diferencia, debe prevalecer la placa del equipo instalado.</p>
                  </div>
                </div>
                <div class="spec-grid">
                  <div class="spec-item"><span class="spec-item__label">Velocidad de apertura</span><span class="spec-item__value">Hasta 1 m/s</span></div>
                  <div class="spec-item"><span class="spec-item__label">Velocidad de cierre</span><span class="spec-item__value">0,6 m/s</span></div>
                  <div class="spec-item"><span class="spec-item__label">Alimentación manual</span><span class="spec-item__value">230 VAC, F+N+T monofásica</span></div>
                  <div class="spec-item"><span class="spec-item__label">Alimentación ficha</span><span class="spec-item__value">220-240 VAC · 50-60 Hz</span></div>
                  <div class="spec-item"><span class="spec-item__label">Potencia</span><span class="spec-item__value">0,40–0,55 kW</span></div>
                  <div class="spec-item"><span class="spec-item__label">Tamaño máximo</span><span class="spec-item__value">A=3000 × H=3500 mm</span></div>
                  <div class="spec-item"><span class="spec-item__label">Resistencia viento</span><span class="spec-item__value">170 Pa (≤ 60 km/h)</span></div>
                  <div class="spec-item"><span class="spec-item__label">Permeabilidad aire</span><span class="spec-item__value">Clase 3</span></div>
                  <div class="spec-item"><span class="spec-item__label">Durabilidad</span><span class="spec-item__value">250.000 ciclos</span></div>
                  <div class="spec-item"><span class="spec-item__label">Zona de aplicación</span><span class="spec-item__value">Interior (0 °C a +50 °C)</span></div>
                  <div class="spec-item"><span class="spec-item__label">Estructura</span><span class="spec-item__value">Aluminio</span></div>
                  <div class="spec-item"><span class="spec-item__label">Lona</span><span class="spec-item__value">PVC ignífugo tipo M2, 0,8 mm (950 g/m²)</span></div>
                </div>
              `
            },
            {
              id: "controlsa-funcionamiento",
              title: "Funcionamiento y modos de operación",
              content: `
                <p>La puerta trabaja en dos modos: <strong>automático</strong> y <strong>manual</strong>.</p>
                <h4>Modo automático</h4>
                <ol>
                  <li>Verificar alimentación y LED verde de tensión.</li>
                  <li>Dar orden de apertura desde pulsador o sistema de activación.</li>
                  <li>La puerta abre hasta posición alta, espera unos segundos y luego cierra.</li>
                  <li>Si durante el cierre detecta obstáculo o nueva orden, invierte el sentido y vuelve a abrir.</li>
                  <li>Puede integrarse con cadena de rodillos o interlock entre varias puertas.</li>
                </ol>
                <h4>Modo manual</h4>
                <ul>
                  <li>Solo para mantenimiento o reparación.</li>
                  <li>Se activa pulsando simultáneamente subir y bajar durante 3 segundos.</li>
                  <li>El movimiento ocurre solo mientras se mantiene pulsada la tecla (persona presente).</li>
                  <li>Para salir del modo manual se pulsa y desenclava la seta de emergencia como rearme.</li>
                </ul>
                <div class="alert-box">En modo manual se anulan detectores de final de movimiento y sistemas de seguridad. El paro de emergencia sigue activo y prevalece sobre la maniobra.</div>
              `
            },
            {
              id: "controlsa-seguridad",
              title: "Seguridad y protecciones",
              content: `
                <p>Protecciones y criterios destacados por el manual:</p>
                <ul>
                  <li><strong>Barrera de seguridad:</strong> evita cierre sobre personas/objetos; si corta el haz durante bajada, la puerta invierte el giro.</li>
                  <li><strong>Célula de tambor:</strong> supervisa el correcto desenrollado de la lona y revierte el movimiento si detecta obstáculo.</li>
                  <li><strong>Paro de emergencia:</strong> debe dejar la puerta sin respuesta a órdenes mientras esté enclavado.</li>
                  <li><strong>Sistema anticaída:</strong> especificado en ficha técnica.</li>
                  <li><strong>Reinserción automática:</strong> la lona puede salir de guías por impacto o sobrepresión y volver a entrar al subir.</li>
                </ul>
                <p><strong>Advertencias:</strong></p>
                <ul>
                  <li>No es una salida de emergencia.</li>
                  <li>No lanzar objetos contra la lona en movimiento.</li>
                  <li>No limpiar con chorro directo de agua ni con materiales abrasivos.</li>
                  <li>La estructura donde se instale debe resistir cargas y esfuerzos de viento.</li>
                  <li>La acometida debe tener protección contra sobretensiones temporales y transitorias.</li>
                </ul>
              `
            },
            {
              id: "controlsa-mantenimiento-guia",
              title: "Mantenimiento preventivo",
              content: `
                <h4>Anual</h4>
                <ul>
                  <li>Revisión mecánica y eléctrica por personal acreditado por CONTROLSA.</li>
                  <li>Verificación del correcto funcionamiento de la puerta y de los sistemas de seguridad.</li>
                  <li>Cambio de baterías del SAI cada 2 años si el sistema aplica.</li>
                </ul>
                <h4>Trimestral</h4>
                <ul>
                  <li>Comprobar funcionamiento del SAI si existe.</li>
                  <li>Probar paro de emergencia y confirmar que la puerta no responde a órdenes.</li>
                  <li>Limpiar fotocélulas y reapretar sus soportes.</li>
                  <li>Revisar botones laterales de la lona y reponer faltantes.</li>
                  <li>Revisar emisores/receptores y verificar barrera de seguridad.</li>
                  <li>Verificar funcionamiento de la célula de tambor durante la bajada.</li>
                </ul>
              `
            },
            {
              id: "controlsa-entradas-diagnostico",
              title: "Entradas, binario y guía para identificar fallas",
              content: `
                <p>El manual muestra una pantalla de <strong>ENTRADAS</strong> dentro del menú de estado. Esa lectura no es una falla por sí sola: es una <strong>guía de diagnóstico</strong> que permite identificar qué señal está activa, qué condición está bloqueando la maniobra y desde ahí llegar a la falla probable.</p>
                <p><strong>Ruta orientativa:</strong> MENU → ESTADO → ENTRADAS.</p>
                <div class="spec-grid">
                  <div class="spec-item"><span class="spec-item__label">S1</span><span class="spec-item__value">PARO = 1 cuando está activado</span></div>
                  <div class="spec-item"><span class="spec-item__label">S2</span><span class="spec-item__value">ABRIR = 1 cuando recibe orden de apertura</span></div>
                  <div class="spec-item"><span class="spec-item__label">S3</span><span class="spec-item__value">DOBLE ALTURA = 1 cuando esa función está activa</span></div>
                  <div class="spec-item"><span class="spec-item__label">S4</span><span class="spec-item__value">BAJAR CADENA DE RODILLOS = 1 cuando recibe esa orden</span></div>
                  <div class="spec-item"><span class="spec-item__label">S5</span><span class="spec-item__value">PARO EMERGENCIA = 1 cuando está enclavado</span></div>
                  <div class="spec-item"><span class="spec-item__label">S6-S8</span><span class="spec-item__value">No identificados claramente en el extracto disponible</span></div>
                </div>
                <p><strong>Cómo leer un patrón tipo 10001:</strong> significa que, de izquierda a derecha, hay entradas activas y desactivadas en ese instante. En el ejemplo del manual, el patrón visible equivale a <strong>paro activo</strong>, <strong>abrir desactivado</strong>, <strong>doble altura desactivado</strong>, <strong>bajar cadena desactivado</strong> y <strong>paro de emergencia activado</strong>. Eso explica por qué la puerta puede quedar inhibida.</p>
                <h4>Uso práctico para diagnóstico</h4>
                <ul>
                  <li>Si <strong>S5 = 1</strong>, revisar de inmediato la seta de emergencia, su enclavamiento y rearme.</li>
                  <li>Si el operador pulsa abrir y <strong>S2 no cambia a 1</strong>, revisar pulsador, sensor de proximidad, radar o señal externa de mando.</li>
                  <li>Si la puerta parece bloqueada sin avería mecánica clara, comparar la maniobra esperada con el estado real de las entradas antes de desmontar nada.</li>
                  <li>Si aparece una combinación ilógica o permanente, revisar cableado, bornes, accesorios conectados y la propia placa electrónica.</li>
                </ul>
                <div class="alert-box">Importante: estas combinaciones binarias deben interpretarse como <strong>estado de entradas</strong>, no como código de error independiente. Justamente por eso sirven como <strong>guía para identificar fallas</strong>: muestran qué señal está activando o inhibiendo la maniobra y orientan la revisión.</div>
              `
            },
            {
              id: "controlsa-fallas-guia",
              title: "Fallas comunes y diagnóstico",
              content: `
                <ol>
                  <li><strong>La puerta no responde:</strong> revisar paro de emergencia, magnetotérmico, reinicio de armario y LEDs de botoneras.</li>
                  <li><strong>Lona fuera de guías:</strong> pasar a modo manual, subir, reinsertar en recuperadores y verificar que quede dentro de ambas guías.</li>
                  <li><strong>La puerta queda abierta:</strong> revisar obstáculo, célula de seguridad, sensor de proximidad y que no esté en modo manual.</li>
                  <li><strong>La lona sube y baja constantemente:</strong> revisar si faltan botones laterales de la lona.</li>
                  <li><strong>Motor bloqueado:</strong> revisar modo manual, interlock/SAS, posición de lona y liberar freno con palanca inferior del motor.</li>
                  <li><strong>Fallo de energía:</strong> apertura manual retirando tapa frontal, desbloqueando motor y accionando llave Allen; con SAI la elevación puede ser automática.</li>
                </ol>
              `
            },
            {
              id: "controlsa-repuestos-guia",
              title: "Repuestos críticos y cíclicos",
              content: `
                <p>El manual no trae una lista cerrada de part numbers, pero sí deja claro qué elementos merecen atención preferente como stock mínimo:</p>
                <ul>
                  <li>Fotocélulas / ópticos de barrera</li>
                  <li>Botones laterales de la lona</li>
                  <li>Baterías del SAI</li>
                  <li>Emisores y receptores</li>
                  <li>Correa / motorización</li>
                  <li>Recuperadores y guías</li>
                </ul>
              `
            }
          ],
          systemAtlas: {
            title: "Vista general + los cinco sistemas de la 114 RL",
            description: "Lectura guiada de la puerta: primero el conjunto, luego cada sistema con su figura del manual, qué lleva, qué se le ajusta y cómo se diagnostica. Las páginas citadas son las del manual de usuario original.",
            machineMap: {
              title: "Puerta rápida autorreparable 114 RL — ficha del fabricante",
              description: "Dibujo acotado y datos de norma EN 13241-1 del propio fabricante. Esta puerta no tiene un plano de grupos con llamadas como las Marchesini, así que aquí no hay puntos: usa la lista de sistemas de abajo.",
              image: { src: "assets/controlsa/p038.jpg", alt: "Puerta rápida autorreparable 114 RL — ficha de producto", page: 38 }
            },
            systems: [
              { id: "lona-guias", name: "Lona, guías y recuperadores", kicker: "Sistema autorreparable", station: "Sistema 1", page: 17, status: "Manual p.17-19",
                figure: { src: "assets/controlsa/p048.jpg", alt: "Guías y recuperadores de la lona", title: "Guías y recuperador", page: 17, caption: "Manual p.17 — las piezas de plástico blancas de la parte superior de las guías son los recuperadores." },
                summary: "Es lo que hace a esta puerta autorreparable: ante un impacto la lona se desprende de las guías en vez de romperse, y al subir vuelve a entrar sola por los recuperadores. Por eso el coste de reparación es bajo, pero exige que los botones laterales estén completos.",
                flow: ["Impacto contra la lona → se desprende de las guías", "Se sube la puerta en modo manual", "La lona entra lateralmente por los recuperadores (plástico blanco, arriba de las guías)", "Se baja acompañándola y se comprueba que está dentro de guías a ambos lados"],
                components: ["Lona de PVC", "Guías laterales", "Recuperadores de plástico blanco", "Botones laterales de la lona", "Tapa trasera del cajón"],
                adjustments: ["Revisión trimestral de los botones laterales, bajando la lona en modo manual y mirándola de arriba abajo (p.15)", "Reinserción en los recuperadores con la lona por encima de ellos (p.18)"],
                diagnostics: ["Lona fuera de guías → apartado 6.2, p.17-18; hay dos procedimientos según si salió sólo de las guías o también de los recuperadores", "La lona sube y baja constantemente → falta un botón lateral, apartado 6.4 p.19; el recambio se pide al SAT de Controlsa"] },
              { id: "seguridad", name: "Seguridad: barrera y célula de tambor", kicker: "Barrera + célula de tambor", station: "Sistema 2", page: 16, status: "Manual p.16",
                figure: { src: "assets/controlsa/p047.jpg", alt: "Comprobación de la barrera de seguridad y la célula de tambor", title: "Las dos protecciones y cómo probarlas", page: 16, caption: "Manual p.16 — la barrera protege el cierre y la puerta abierta; la célula de tambor protege todo el descenso." },
                summary: "Son dos protecciones distintas y se prueban distinto. La barrera protege durante el cierre y mientras la puerta está abierta, hasta que la lona alcanza la posición del haz. La célula de tambor protege durante todo el movimiento descendente, y es la que actúa cuando algo impide que la lona se desenrolle bien.",
                flow: ["Puerta abierta con la barrera obstaculizada → no debe poder bajar", "Durante el cierre, si se corta el haz → invierte el giro y vuelve a puerta abierta", "Durante la bajada, si la célula de tambor detecta el corte → invierte igualmente"],
                components: ["Barrera de seguridad (emisores y receptores)", "Célula de tambor", "Célula de paro y cambio de velocidad (si la hay)", "Paro de emergencia", "Sistema anticaída"],
                adjustments: ["Limpieza trimestral de todas las fotocélulas (p.15)", "Reapriete de los soportes de las fotocélulas (p.15)", "Revisión del aspecto general de emisores y receptores (p.15)"],
                diagnostics: ["La puerta se queda abierta → obstáculo cerca, célula sucia o mal orientada, u orden de subir permanente del sensor de proximidad o radar (6.3, p.19)", "Prueba de la célula de tambor: sujetar la bolsa inferior durante la bajada. Si hace falta fuerza excesiva, soltar de inmediato (p.16)"] },
              { id: "control-electrico", name: "Cuadro eléctrico de maniobra", kicker: "Placa electrónica Controlsa", station: "Sistema 3", page: 10, status: "Manual p.10-13",
                figure: { src: "assets/controlsa/p041.jpg", alt: "Cuadro eléctrico de maniobra", title: "Elementos del cuadro y externos", page: 10, caption: "Manual p.10 — botoneras de hombre presente, paro de emergencia y elementos del armario." },
                summary: "El cerebro de la puerta: una placa electrónica Controlsa y un magnetotérmico dentro del armario, con las botoneras y los paros de emergencia como elementos externos. Los estados se consultan desde el display con MENU → ESTADO.",
                flow: ["Pantalla de inicio → MENU", "Menú de estado → INTRO", "Indicadores de estado y otros parámetros informativos (p.12-13)"],
                components: ["Placa electrónica Controlsa", "Magnetotérmico del armario", "Botoneras de hombre presente", "Pulsador de paro de emergencia", "Semáforos", "SAI (opcional)"],
                adjustments: ["Verificación trimestral del SAI, desconectándolo de la alimentación (p.15)", "Cambio de baterías del SAI cada dos años, recomendado por el fabricante (p.14)"],
                diagnostics: ["La puerta no responde → 6.1 (p.17): mirar el paro de emergencia, apagar el magnetotérmico, esperar unos 10 s a que se apaguen los equipos internos y volver a conectarlo, y comprobar que se encienden los LED de las botoneras"] },
              { id: "motorizacion", name: "Motorización y apertura sin corriente", kicker: "Motor + transmisión", station: "Sistema 4", page: 21, status: "Manual p.21",
                figure: { src: "assets/controlsa/p029.jpg", alt: "Apertura de la puerta en caso de corte eléctrico", title: "Qué hacer sin suministro eléctrico", page: 21, caption: "Manual p.21 — con corte de suministro los motores quedan bloqueados." },
                summary: "Mueve la lona por transmisión de correa y tambor de enrollado. Lo importante para planta: si se va la corriente los motores quedan bloqueados, y la apertura se hace por el procedimiento del apartado 7 del manual.",
                flow: ["Orden de apertura → motor → correa → tambor de enrollado", "Corte de suministro → motores bloqueados → apertura según el apartado 7"],
                components: ["Motor", "Correa de transmisión", "Tambor de enrollado", "Freno y palanca de desbloqueo", "SAI para elevación automática (opcional)"],
                adjustments: ["Revisión mecánica y eléctrica anual, por persona acreditada por Controlsa (p.14)"],
                diagnostics: ["Motor bloqueado → 6.5 (p.20). Ojo: en MODO MANUAL se anulan los detectores de final de movimiento y los sistemas de seguridad"] },
              { id: "activacion", name: "Modos de funcionamiento y activación", kicker: "Automático / manual", station: "Sistema 5", page: 7, status: "Manual p.7-9",
                figure: { src: "assets/controlsa/p020.jpg", alt: "Funcionamiento de la puerta: modos automático y manual", title: "Los dos modos de trabajo", page: 7, caption: "Manual p.7 — el modo manual es sólo para mantenimiento." },
                summary: "La puerta trabaja en automático; el modo manual (hombre presente) es sólo para mantenimiento y anula los finales de carrera y las seguridades, así que se usa con la puerta acompañada y a pulsaciones cortas.",
                flow: ["Automático: orden de apertura desde pulsador, sensor de proximidad, radar o interlock", "Manual: pulsaciones cortas de ABRIR/CERRAR, con movimientos suaves", "Salir de manual: pulsar y desenclavar la seta de emergencia como rearme"],
                components: ["Pulsador de abrir", "Sensor de proximidad o radar", "Interlock con otras puertas", "SAS / cadena de rodillos"],
                adjustments: ["Prueba trimestral del paro de emergencia: al pulsarlo el LED rojo se enciende unos segundos o el verde se apaga, y la puerta no responde a ninguna orden (p.15)"],
                diagnostics: ["Si la puerta no responde, comprobar antes de nada que no se quedó en modo manual (6.3, p.19)"] }
            ]
          },
          systems: [
            { name: "Lona y guías", function: "Abrir/cerrar paso y permitir reinserción automática ante impacto.", components: ["Lona PVC", "Guías", "Recuperadores", "Botones laterales"], status: "Base manual consolidada" },
            { name: "Motorización", function: "Mover la lona mediante transmisión por correa y tambor de enrollado.", components: ["Motor", "Correa", "Tambor", "Freno / palanca de desbloqueo"], status: "Base manual consolidada" },
            { name: "Control eléctrico", function: "Gestionar maniobra, variador, entradas/salidas y accesorios.", components: ["Placa electrónica", "Variador integrado", "Magnetotérmico 10 A", "Botonera", "Semáforos"], status: "Base manual consolidada" },
            { name: "Seguridad", function: "Proteger al usuario durante apertura/cierre.", components: ["Barrera de seguridad", "Célula de tambor", "Paro de emergencia", "Sistema anticaída"], status: "Base manual consolidada" },
            { name: "Activación e integración", function: "Recibir órdenes de apertura/cierre e integrarse con otras puertas o línea.", components: ["Pulsador abrir", "Sensor de proximidad", "Interlock", "SAS / cadena de rodillos"], status: "Base manual consolidada" }
          ],
          spareParts: [
            { name: "Fotocélulas / ópticos", system: "Seguridad: barrera y célula de tambor", type: "Eléctrico", criticality: "Alta", status: "Base manual consolidada", function: "Detección de obstáculos y corte de haz." },
            { name: "Botones laterales de lona", system: "Lona, guías y recuperadores", type: "Desgaste", criticality: "Alta", status: "Base manual consolidada", function: "Mantener guiado correcto de la lona." },
            { name: "Baterías SAI", system: "Cuadro eléctrico de maniobra", type: "Consumible cíclico", criticality: "Media", status: "Base manual consolidada", function: "Respaldar apertura automática ante corte eléctrico." },
            { name: "Correa de transmisión", system: "Motorización y apertura sin corriente", type: "Mecánico", criticality: "Alta", status: "Base manual consolidada", function: "Transmitir movimiento desde motor al tambor." },
            { name: "Recuperadores", system: "Lona, guías y recuperadores", type: "Mecánico", criticality: "Alta", status: "Base manual consolidada", function: "Permitir reentrada de la lona a las guías." },
            { name: "Sensor de proximidad", system: "Modos de funcionamiento y activación", type: "Sensor", criticality: "Media", status: "Base manual consolidada", function: "Dar orden de apertura por presencia." }
          ],
          maintenanceTasks: [
            { name: "Prueba del paro de emergencia", system: "Seguridad: barrera y célula de tambor", frequency: "Trimestral", type: "Preventivo", status: "Base manual consolidada", acceptance: "La puerta no responde a órdenes y el LED cambia según lo descrito." },
            { name: "Limpieza de fotocélulas", system: "Seguridad: barrera y célula de tambor", frequency: "Trimestral", type: "Preventivo", status: "Base manual consolidada", acceptance: "Ópticos limpios, alineados y sin falsos disparos." },
            { name: "Revisión de botones laterales de lona", system: "Lona, guías y recuperadores", frequency: "Trimestral", type: "Preventivo", status: "Base manual consolidada", acceptance: "No faltan botones y la lona guía correctamente." },
            { name: "Prueba de barrera de seguridad", system: "Seguridad: barrera y célula de tambor", frequency: "Trimestral", type: "Funcional", status: "Base manual consolidada", acceptance: "La puerta no baja con barrera ocupada e invierte al cortar el haz durante el cierre." },
            { name: "Prueba de célula de tambor", system: "Seguridad: barrera y célula de tambor", frequency: "Trimestral", type: "Funcional", status: "Base manual consolidada", acceptance: "La puerta invierte la maniobra si se obstaculiza el desenrollado." },
            { name: "Revisión mecánica y eléctrica integral", system: "Equipo completo", frequency: "Anual", type: "Preventivo", status: "Base manual consolidada", acceptance: "Funcionamiento correcto de maniobra, seguridad y componentes eléctricos/mecánicos." }
          ],
          failureModes: [
            {
              name: "La puerta no responde", probableSystem: "Control eléctrico / seguridad", status: "Base manual consolidada",
              symptoms: ["Sin maniobra", "Botoneras sin respuesta"],
              checks: ["Paro de emergencia", "Magnetotérmico", "Reinicio del armario", "LEDs de botoneras"],
              steps: [
                { title: "Paro de emergencia", where: "Botones de hongo rojos en las botoneras exteriores y en el interior del armario eléctrico.", how: "Localiza todos los botones de emergencia. Gira cada uno 45° en sentido horario hasta que salte hacia arriba (posición liberada). Si alguno estaba pulsado, la puerta no respondía por eso.", spec: "Todos los botones en posición arriba (liberados)", tool: null, ifFail: "Si al liberar un botón la puerta recupera respuesta, el problema estaba en ese paro de emergencia. Verificar que el botón no esté roto o trabado — si se vuelve a disparar solo, reemplazarlo." },
                { title: "Magnetotérmico (breaker) del armario", where: "Interior del armario eléctrico, interruptor magnetotérmico principal, visible al abrir la puerta del armario.", how: "Observa la palanca del magnetotérmico: debe estar en posición ON (arriba). Si está en OFF o en posición intermedia (disparado), espera 30 segundos, presiona el botón RESET si lo tiene y lleva la palanca a ON.", spec: "Palanca en posición ON", tool: null, ifFail: "Si el magnetotérmico se vuelve a disparar al energizar, hay un cortocircuito o sobrecarga en la instalación. No forzar ON repetidas veces. Llamar a técnico eléctrico para medir la línea." },
                { title: "Reinicio completo del armario", where: "Interruptor principal del armario eléctrico.", how: "Con el magnetotérmico en ON, apaga el interruptor principal del armario. Espera 10 segundos completos. Enciende de nuevo. Observa si los LEDs de las botoneras se iluminan al energizar.", spec: "LEDs de botoneras encendidos tras el reinicio", tool: null, ifFail: "Si los LEDs no encienden tras el reinicio, revisar el siguiente paso (alimentación)." },
                { title: "Alimentación al armario", where: "Tablero general de la planta, línea de suministro al armario de la puerta.", how: "Con voltímetro, mide la tensión en los bornes de entrada del armario. Compara con la tensión nominal de la puerta (ver placa del armario).", spec: "Tensión nominal según placa (generalmente 380V trifásico o 220V)", tool: "Voltímetro o multímetro", ifFail: "Sin tensión correcta → verificar fusibles y protecciones en el tablero general. Si hay tensión pero la puerta no responde, la placa electrónica puede estar dañada." }
              ]
            },
            {
              name: "Lona fuera de guías", probableSystem: "Lona y guías", status: "Base manual consolidada",
              symptoms: ["Lona desplazada lateralmente", "Atasco lateral", "Frunces en el borde"],
              checks: ["Modo manual activo", "Recuperadores accesibles", "Reinserción lateral", "Estado de guías"],
              steps: [
                { title: "Activar modo manual", where: "Panel del armario eléctrico, selector de modo.", how: "Mueve el selector rotativo a posición MANUAL. Esto desactiva el cierre automático para poder manipular la lona sin que la máquina intente corregir.", spec: null, tool: null, ifFail: "Si el selector no responde, verificar alimentación del armario (ver falla 'La puerta no responde')." },
                { title: "Bajar la lona hasta posición accesible", where: "Botonera de mando, botón de bajada (flecha abajo o CIERRE).", how: "Pulsa el botón de bajada en modo manual. Baja la lona hasta que el borde lateral desplazado quede a altura de trabajo (entre 1 y 1.5 m del suelo).", spec: null, tool: null, ifFail: "Si la lona no baja con el mando manual, usar la palanca de liberación manual del motor (ver falla 'Motor bloqueado')." },
                { title: "Insertar borde de la lona en la guía", where: "Borde lateral de la lona y canal de guía (perfil en C o perfil de ranura lateral).", how: "El borde de la lona tiene botones o cordón guía. Introduce ese borde en la boca del perfil de guía desde el extremo inferior. Empuja con la mano hacia adentro del canal mientras pulsas subida lentamente — guía el borde con una mano mientras la lona sube.", spec: "El borde debe entrar en el canal sin forzar", tool: null, ifFail: "Si el borde no entra, revisar que el perfil no esté doblado o que no haya un objeto dentro del canal." },
                { title: "Usar los recuperadores", where: "Cintas o varillas recuperadoras laterales (uno en cada lado, generalmente de color o material diferente al de la lona).", how: "Mientras la lona sube despacio, tira de los recuperadores hacia el canal para guiar el borde. Los recuperadores son la forma prevista por el fabricante para esta maniobra.", spec: null, tool: null, ifFail: "Si la lona sale de nuevo al subir, los recuperadores pueden estar rotos o desgastados. Verificar que aún estén unidos al borde de la lona." },
                { title: "Inspeccionar las guías laterales", where: "Perfiles de guía en ambos lados del vano de la puerta.", how: "Recorre el perfil de arriba abajo visualmente y con la mano. Busca: doblez o deformación (un golpe de carretilla es la causa más común), suciedad o grasa acumulada que trabe el deslizamiento, tornillos de fijación sueltos que desplazan el perfil.", spec: "Perfil recto, limpio y fijado a la pared", tool: "Llave Allen o destornillador según tornillos de fijación", ifFail: "Perfil doblado: enderezar con prensa o reemplazar. Tornillos sueltos: apretar y re-alinear el perfil con nivel de burbuja." }
              ]
            },
            {
              name: "Puerta permanece abierta", probableSystem: "Seguridad / activación", status: "Base manual consolidada",
              symptoms: ["No inicia el cierre automático", "Queda en posición abierta"],
              checks: ["Obstáculo en zona de paso", "Fotocélulas limpias", "Sensor de proximidad activo", "Modo manual"],
              steps: [
                { title: "Despejar obstáculos en la zona de paso", where: "Toda el área de apertura de la puerta: frente, lados y suelo bajo la lona.", how: "Retira cualquier objeto (paleta, carretilla, persona) del área. La barrera de seguridad (fotocélula o barrera láser) bloquea el cierre mientras detecte algo. Verifica que no haya nada colgando que corte el haz.", spec: "Zona libre de objetos en toda la altura y ancho del vano", tool: null, ifFail: "Si la zona está libre y la puerta sigue abierta, pasar al siguiente paso." },
                { title: "Limpiar las fotocélulas de seguridad", where: "Par emisor/receptor fotoeléctrico montado en los marcos laterales de la puerta, a unos 10–30 cm del suelo.", how: "Localiza cada fotocélula (son pequeñas cajas con lente transparente). Limpia la lente con paño seco y suave. No uses agua ni solventes. Comprueba que el LED de estado de la fotocélula esté verde o en el color de 'haz libre' según el modelo.", spec: "LED de estado en color de 'haz libre' (generalmente verde)", tool: "Paño seco", ifFail: "Si el LED sigue en estado de 'haz cortado' con la zona libre y las lentes limpias, la fotocélula puede estar desalineada o dañada. Re-alinear emisor y receptor en el mismo eje horizontal." },
                { title: "Probar cierre en modo manual", where: "Panel del armario, selector de modo + botón de cierre.", how: "Activa MANUAL desde el selector. Pulsa el botón de cierre. Si la puerta cierra en modo manual → el problema está en la señal de activación automática (sensor de proximidad, temporizador o mando externo), no en el mecanismo. Si en manual tampoco cierra → hay problema mecánico o de motor.", spec: null, tool: null, ifFail: "No cierra en manual: revisar falla 'Motor bloqueado'. Sí cierra en manual: revisar sensor de proximidad en el siguiente paso." },
                { title: "Verificar sensor de proximidad o radar", where: "Sensor montado en el marco superior o lateral, orientado a la zona de detección de vehículos o personas.", how: "Localiza el sensor. Limpia su cara activa con paño seco. Pasa la mano o un objeto frente al sensor a la distancia de detección nominal. El LED del sensor debe cambiar de estado al detectar. Si no cambia, el sensor no está funcionando.", spec: "LED del sensor cambia al pasar objeto frente a él", tool: null, ifFail: "Sensor sin respuesta: verificar que tenga alimentación (mide con voltímetro en sus bornes), revisar cableado hasta el armario y si sigue sin funcionar, reemplazar el sensor." }
              ]
            },
            {
              name: "Sube y baja constantemente", probableSystem: "Lona y guías", status: "Base manual consolidada",
              symptoms: ["Ciclos de apertura y cierre repetitivos", "Inestabilidad en posición de cierre"],
              checks: ["Botones laterales faltantes", "Estado de lona", "Sensores de posición"],
              steps: [
                { title: "Inspeccionar botones laterales de la lona", where: "Bordes laterales de la lona, de arriba abajo en ambos lados.", how: "Recorre el borde lateral de la lona mientras está en posición de cierre. Cuenta los botones (o remaches/cordón) que mantienen el guiado. Busca espacios donde falten botones consecutivos.", spec: "Sin botones faltantes en ningún tramo de más de 3 posiciones consecutivas", tool: null, ifFail: "Varios botones faltantes en un tramo: la lona pierde guiado en ese punto, activa el sensor de 'lona fuera de guía' y la puerta reabre. Reponer los botones con el kit de reparación del fabricante o contactar CONTROLSA para repuesto de borde." },
                { title: "Revisar estado general de la lona", where: "Superficie completa de la lona, inspeccionada con la puerta en posición de cierre.", how: "Busca rasgaduras, agujeros, dobleces permanentes o partes que sobresalgan del plano de la lona. Una lona dañada puede activar sensores de obstrucción de forma intermitente.", spec: "Lona plana, sin daños estructurales visibles", tool: null, ifFail: "Lona con rasgadura o agujero significativo: puede necesitar reparación o sustitución. Para daños menores, el fabricante puede proveer parches autoadhesivos. Contactar CONTROLSA para evaluar." }
              ]
            },
            {
              name: "Motor bloqueado", probableSystem: "Motorización", status: "Base manual consolidada",
              symptoms: ["La lona no sube ni baja", "Motor hace ruido pero sin movimiento"],
              checks: ["Modo manual activo", "Bloqueo SAS/interlock en pantalla", "Posición de fin de carrera", "Palanca de desbloqueo manual"],
              steps: [
                { title: "Verificar bloqueos activos en pantalla", where: "Pantalla del armario eléctrico.", how: "Navega MENU > ESTADO > ENTRADAS. Revisa si hay alguna entrada de bloqueo activa (S5 paro de emergencia, fin de carrera activado, señal de error). Anota qué entradas están en estado 1.", spec: null, tool: null, ifFail: "S5 = 1: liberar paro de emergencia (ver primera falla). Fin de carrera activado: la lona puede haber sobrepasado su límite de recorrido — pasar al paso siguiente." },
                { title: "Comprobar fin de carrera de la lona", where: "Límites físicos superior e inferior del recorrido de la lona.", how: "En modo manual, intenta bajar si la lona está arriba, o subir si está abajo. Si solo funciona en una dirección, la lona puede haber sobrepasado el fin de carrera en el otro extremo. Revisa físicamente que la lona no esté enredada ni haya pasado más allá del tope.", spec: "Lona dentro del rango de recorrido nominal", tool: null, ifFail: "Si la lona pasó el tope superior: desconecta el armario y libera manualmente (paso siguiente). Si es tope inferior: la lona puede haberse enrollado en exceso en el tambor." },
                { title: "Liberación manual del motor", where: "Parte inferior o lateral del sistema de motorización (tambor y caja reductora), palanca o tornillo de liberación manual.", how: "Localiza la palanca de desbloqueo manual (generalmente una palanca roja o una palomilla). Actívala para desacoplar el freno del motor. Con el motor desacoplado, mueve la lona manualmente hacia la posición correcta. Re-engrana el motor después.", spec: null, tool: null, ifFail: "Si la lona no puede moverse ni manualmente, hay un atasco mecánico (objeto dentro del tambor, correa rota). Verificar el interior del tambor con linterna." },
                { title: "Inspeccionar correa de transmisión", where: "Caja de transmisión entre motor y tambor de enrollado.", how: "Accede a la caja de transmisión (generalmente en la parte superior del vano). Inspecciona la correa: busca cortes, desgaste lateral o que se haya salido de la polea.", spec: "Correa entera, sin cortes, bien asentada en ambas poleas", tool: "Linterna", ifFail: "Correa rota o salida de polea: reemplazar por la referencia del fabricante. No usar una correa de medida diferente." }
              ]
            },
            {
              name: "Lectura anómala en ENTRADAS", probableSystem: "Control eléctrico / seguridad / mandos", status: "Base manual consolidada",
              symptoms: ["La puerta no ejecuta una orden", "Bits activos inesperados en pantalla", "Maniobra inhibida sin causa mecánica visible"],
              checks: ["MENU > ESTADO > ENTRADAS", "S5 paro de emergencia", "S2 orden de abrir", "Sensor proximidad / pulsadores", "Bornes y cableado"],
              correction: "Interpretar lectura binaria: S5=1 → rearmar emergencia; S2 no cambia → reparar cadena de mando; combinación incoherente → revisar conexiones.",
              steps: [
                { title: "Acceder al menú de entradas", where: "Pantalla táctil del armario eléctrico.", how: "Navega por los menús: MENU > ESTADO > ENTRADAS. Se muestra una tabla con el nombre de cada entrada y su estado actual (0 = inactiva, 1 = activa). Fotografía o anota el estado de todas las entradas antes de tocar nada.", spec: null, tool: "Cámara de teléfono para documentar el estado", ifFail: null },
                { title: "Verificar S5 — paro de emergencia", where: "Entrada S5 en la pantalla de ENTRADAS.", how: "Observa el bit S5. Si S5 = 1, hay un paro de emergencia activo. Busca y libera todos los botones de hongo (girar 45°). Verifica que S5 cambie a 0 al liberarlos.", spec: "S5 = 0 en operación normal", tool: null, ifFail: "S5 sigue en 1 aunque todos los botones estén liberados: el contacto del paro de emergencia está pegado o hay un cable cortocircuitado. Revisar cada botón con continuómetro en sus bornes." },
                { title: "Verificar S2 — orden de abrir", where: "Entrada S2 en la pantalla de ENTRADAS.", how: "Pulsa el mando de apertura (botonera o sensor de proximidad) y observa S2 en tiempo real. Debe cambiar de 0 a 1 al dar la orden y volver a 0 al soltar.", spec: "S2 cambia de 0 a 1 al activar el mando", tool: null, ifFail: "S2 no cambia: el mando no llega señal a la placa. Revisar conexiones en el borne de S2 en el armario (continuómetro entre borne y mando). Si hay continuidad pero S2 no cambia, la entrada de la placa puede estar dañada." },
                { title: "Verificar sensores y pulsadores uno a uno", where: "Cada entrada listada en MENU > ESTADO > ENTRADAS.", how: "Activa cada fuente de señal (sensor de proximidad, radar, pulsador manual, células de seguridad) de a uno y verifica que el bit correspondiente cambie en pantalla. Cualquier señal que no cambie indica un problema en ese sensor o su cableado.", spec: "Cada bit cambia al activar su fuente de señal", tool: "Continuómetro o multímetro", ifFail: "Señal que no cambia: mide tensión en el borne del armario al activar el sensor. Sin tensión → problema en sensor o cable. Con tensión pero bit no cambia → entrada dañada en la placa electrónica." }
              ]
            }
          ],
          documents: [
            { name: "Manual de usuario original Controlsa", status: "Disponible", file: "manuales/controlsa/Controlsa-114RL-manual.pdf" },
            { name: "Ficha técnica 114RL006", status: "Disponible", file: "manuales/controlsa/Controlsa-114RL-manual.pdf" },
            { name: "Referencia documental MM-114RLAEP0V03", status: "Disponible", file: "manuales/controlsa/Controlsa-114RL-manual.pdf" },
            { name: "Placa técnica del equipo instalado", status: "Pendiente" },
            { name: "Registro local de instalación y mantenimiento", status: "Pendiente" },
            { name: "Lista de repuestos originales con referencias", status: "Pendiente" }
          ]
        },
        {
          id: "ms235",
          equipoCod: "17334017",
          name: "Ensobradora Schmucker MS235",
          model: "Schmucker MS235",
          current: "",
          area: "Empaque · Ensobrado (bustinatrice)",
          location: "Sede 4",
          status: "Operativo",
          criticality: "Alta",
          manual: "5 manuales S4220003: eléctrico (97 h) + calibrado (152 p) + cambio formato (34 p) + piezas + recambios 2a + materiales",
          maintenance: "",
          completion: 92,
          image: "assets/ms235/hoja-B00.jpg",
          notes: "",
          searchAliases: ["ms235","schmucker","smucker","smuker","smoker","marchesini","s4220003","despiece","tavola","recambio","grupo","ensobradora","bustinatrice","encelofanadora","telerruptor","contactor","km44.4","km44","electrico","eléctrico","plano","esquema","beckhoff","lenze","resistencias","planchas","anomalia","calibrado","fasature","sincronizacion","cambio formato","recambios","piezas","materiales contacto","L1","causa","sistemas","portabobinas","fotocelula","dosificacion","corte","soldadura","transporte","neumatica","cadena","cinta","mordazas","membrana"],
          description: "Ensobradora automática Schmucker / Marchesini MS235 S4220003 — formado, dosificación, corte y soldadura de sobres. Ficha didáctica con mapa tocable de 6 sistemas, plan de mantenimiento preventivo (18 tareas p.58-149), 6 fallas diagnosticables y 30 repuestos unificados (Excel 7419xx + manual P/N + lista 2 años). Plano eléctrico ES4220003 navegable.",
          technicalData: {
            function: "Ensobradora automática (formado, llenado y sellado de sobres). Las planchas soldantes se calientan con resistencias que el PLC habilita a través del contactor general KM44.4.",
            voltage: "3×220 V + N + PE · 60 Hz (confirmado en placa)",
            current: "33 A a plena carga",
            power: "11 kW",
            control: "24 V DC",
            plc: "Beckhoff EtherCAT (EK1100 + módulos EL18xx/EL28xx + safety EL6910)",
            drives: "5× variador Lenze i550 0,37 kW + servoejes Beckhoff AX8620 / AX8206",
            manufacturer: "Schmucker S.r.l. (Marchesini Group) · Romans d'Isonzo, Italia",
            serialNumber: "S4220003",
            year: "2023",
            weight: "—",
            dimensions: "—"
          },
          summarySpecs: [
            { label: "Tensión", value: "3×220 V · 60 Hz" },
            { label: "Mando", value: "24 V DC" },
            { label: "Potencia", value: "11 kW · 33 A" },
            { label: "PLC", value: "Beckhoff EtherCAT" },
            { label: "Variadores", value: "5× Lenze i550" },
            { label: "Esquema", value: "ES4220003 · 97 hojas" }
          ],
          schematic: true,
          causaCod: "L1",
          causaDesc: "Ensobrado (bustinatrice) - MS235 S4220003 - familia ENVASADO SOBRES",
          guideSections: [
            {
              id: "ms235-resumen",
              title: "Resumen y datos de placa (MS235 - Schmucker S4220003)",
              content: `
                <div class="guide-media">
                  <div class="guide-media__img"><img src="assets/ms235/hoja-B00.jpg" alt="MS235 Schmucker - plano general" loading="lazy"></div>
                  <div class="guide-media__body">
                    <p><strong>Equipo:</strong> Ensobradora automática (bustinatrice) Schmucker / Marchesini Group</p>
                    <p><strong>Modelo:</strong> MS235 &middot; <strong>Matrícula:</strong> S4220003 &middot; <strong>Cliente:</strong> C.I. Farmacápsulas S.A.</p>
                    <p><strong>Pedido:</strong> M2522000053 del 29/07/2022 &middot; <strong>Idioma doc.:</strong> SPA (traducción del original IT)</p>
                    <p><strong>Tensión:</strong> 3x220 V + N + PE &middot; 60 Hz &middot; 33 A &middot; 11 kW &middot; Mando 24 V DC</p>
                    <p><strong>PLC:</strong> Beckhoff EtherCAT (EK1100 + EL18xx/EL28xx + EL6910 safety) &middot; <strong>Variadores:</strong> 5x Lenze i550</p>
                    <p><strong>Código interno Farmacápsulas:</strong> 17334017 &middot; <strong>Código causa:</strong> L1 (ENVASADO SOBRES 1 / ENCELOFANADO - familia 130799)</p>
                    <p><strong>Documentación integrada:</strong> Esquema eléctrico ES4220003 (97 hojas) + Calibrado/Regulaciones (152 pág.) + Cambio de formato (34 pág.) + Piezas de recambio + Recambios 2 años + Materiales en contacto.</p>
                  </div>
                </div>
                <p>Esta ficha consolida los <strong>5 manuales</strong> que entregaste. Abre cada pestaña para el detalle y usa los PDFs en <em>manuales/ms235/</em> para el texto original página a página.</p>
                <div class="alert-box" style="background:#eef4ff;border-color:#cdddff">Tip: busca por <strong>código de causa</strong> (ej. L1, J2, K4) en el buscador global.</div>
              `
            },
            {
              id: "ms235-calibrado",
              title: "Calibrado y sincronizaciones — Fasature (152 pág. ITA/SPA)",
              content: `
                <h4>Qué es este manual <span class="src-tag src-manual">S4220003 - 4-Calibrado</span></h4>
                <p>Manual <strong>CALIBRAZIONE / CALIBRADO - REGULACIONES</strong> para la <strong>bustinatrice MS235 S4220003</strong>. 152 páginas bilingüe IT/ES. Cubre <strong>fasature (puestas en fase)</strong>, <strong>mantenimiento preventivo</strong> y <strong>regulaciones</strong> por grupo funcional (códigos S4M/S4A/S4G/S3).</p>
                <h4>Índice destacado (toc del PDF)</h4>
                <ul>
                  <li><strong>Fasature sull'impianto / Sincronización</strong> (p.21): interpretación de tablas, secuencia de verificaciones, índice general (p.24-26).</li>
                  <li><strong>S4M14100110-2.1 GRUPPO SALDATURA</strong> (p.28) &middot; <strong>S4M95100110-2.1 FOTOCÉLULA</strong> (p.29) &middot; <strong>S4A19100720-1.1 GRUPO CUCHILLAS</strong> (p.31-32).</li>
                  <li><strong>Manutenzione preventiva</strong> (p.33-36): condiciones de seguridad, tablas, <strong>lubricantes recomendados</strong> (p.37).</li>
                  <li><strong>Tabelle verifica manutenzione</strong> (p.42) y <strong>sostituzioni preventive</strong> (p.54).</li>
                </ul>
                <h4>Grupos cubiertos (p.58-149)</h4>
                <table class="crit-table"><thead><tr><th>Grupo</th><th>Ficha</th><th>Pág.</th></tr></thead><tbody>
                  <tr><td>S4M02100110</td><td>Cadena, filtro, cambio aceite, nivel y vaso</td><td>58-64</td></tr>
                  <tr><td>S4M12100110</td><td>Desmontaje/montaje + rulos &amp; lámina corte</td><td>65-70</td></tr>
                  <tr><td>S4M14100110</td><td>Engrase placas, mordazas, filtro aire, membrana</td><td>71-81</td></tr>
                  <tr><td>S4M151/161/171</td><td>Guías placa anclaje, cadena, guías papel</td><td>82-85</td></tr>
                  <tr><td>S4A081/121/191</td><td>Juntas esféricas, correas, rulos</td><td>89-97</td></tr>
                  <tr><td>S4A19100720</td><td>Cuchillo fijo/giratorio, distancia, depósito aire</td><td>98-107</td></tr>
                  <tr><td>S4A261 (x4)</td><td>Correas, cuchilla, cojinetes bobina, freno</td><td>108-117</td></tr>
                  <tr><td>S4A702/711/751</td><td>Cinta, juntas, rulos reenvío</td><td>119-126</td></tr>
                  <tr><td>S4A96100120</td><td>Instalación eléctrica</td><td>127-134</td></tr>
                  <tr><td>S4G71500310 / S4G71500410</td><td>Dosificación, ejes, muelles, enrasador</td><td>135-146</td></tr>
                  <tr><td>S4G72200210</td><td>Estrella alimentación</td><td>147-149</td></tr>
                </tbody></table>
                <p class="callout">PDF: <code>manuales/ms235/MS235-4-Calibrado-Regulaciones-S4220003-ITA-SPA.pdf</code> (152 pág.).</p>
              `
            },
            {
              id: "ms235-cambio-formato",
              title: "Cambio de formato y optimización (34 pág.)",
              content: `
                <h4>Manual 4A <span class="src-tag src-manual">S4220003</span></h4>
                <p><strong>CAMBIO FORMATO, OTTIMIZZAZIONE DISPOSITIVI / CAMBIO DE FORMATO, OPTIMIZACIÓN DISPOSITIVOS</strong> para MS235. 34 pág. IT/ES. Explica <strong>cómo cambiar de formato</strong> y <strong>optimizar cada dispositivo</strong> con fichas técnicas de planteamiento.</p>
                <ul>
                  <li><strong>Informazioni generali</strong> (p.5-9): versiones, placas, simbología.</li>
                  <li><strong>Introduzione</strong> (p.11-17): seguridad operativa, accesorios y regulación (muescas/galgas/reguladores).</li>
                  <li><strong>Cambio Formato</strong> (p.19-22): generalidades, procedimiento y fichas.</li>
                  <li><strong>S4M14100110-1.1 SUSTITUCIÓN PLACAS SELLADO</strong> (p.24)</li>
                  <li><strong>S4A12100110-1.1 REGULACIÓN FASE TOMA DE SOBRES</strong> (p.28)</li>
                  <li><strong>S4G71500310-1.1 y S4G71500410-1.1 DOSIFICADOR VOLUMÉTRICO</strong> (p.29-32)</li>
                </ul>
                <p>PDF: <code>manuales/ms235/MS235-4a-Cambio-Formato-Optimizacion-S4220003-ITA-SPA.pdf</code></p>
              `
            },
            {
              id: "ms235-recambios",
              title: "Piezas de recambio — catálogo + recomendados 2 años",
              content: `
                <h4>Catálogo general <span class="src-tag src-manual">S4220003 - 5-Piezas</span></h4>
                <p>PDF <strong>5-Piezas de recambio</strong> (001_70_01M05) en <code>MS235-5-Piezas-de-Recambio-S4220003-ITA-SPA.pdf</code>. Despiece por grupo (S4M/S4A/S4G/S3E). Pide por <strong>código Schmucker P/N</strong>.</p>
                <h4>Lista recomendada 2 años <span class="src-tag src-reco">lista n.36 - 05/05/23</span></h4>
                <p>5 páginas con lo que Schmucker recomienda tener en stock. Extracto:</p>
                <table class="crit-table"><thead><tr><th>Grupo</th><th>Cód.</th><th>Ejemplos</th></tr></thead><tbody>
                  <tr><td>GR.MOT.PRINC / TRASCINAM / SALDATURA / PORTA BOBINA</td><td>S4M021..S4A191</td><td>Bomba DROPSA 3099127, filtro 3088055, rulos, correa 124 L075</td></tr>
                  <tr><td>COLTELL / SALDATRICE / DOSADORES</td><td>S4A19100720..S4G722</td><td>Cuchillas, membrana L=149, guías mordaza, cintas</td></tr>
                  <tr><td>Eléctrico QE1</td><td>S3E01052010</td><td>SITOP 20A, <strong>3RT2326-1BB40</strong> + 3RT2926-1ER00, Weidmüller, Siemens 5SY6, Beckhoff</td></tr>
                  <tr><td>Eléctrico BM/PC + neumática</td><td>S3E01052100..S4M901</td><td>EK1100, EL6910, Lenze i550, SICK/Wenglor, SMC, Euchner CTP, IPC 477E</td></tr>
                </tbody></table>
                <p>PDF: <code>MS235-Recambios-Recomendados-2-Anos-S4220003-ITA-SPA.pdf</code></p>
              `
            },
            {
              id: "ms235-materiales-contacto",
              title: "Materiales en contacto con producto",
              content: `
                <h4>List of materials in direct contact <span class="src-tag src-manual">001_90_01157</span></h4>
                <p>Certificado 2 pág. ITA/ENG 29/07/2022. Materiales: <strong>AISI 316L</strong> (mayoría), <strong>304</strong>, <strong>PMMA</strong> y <strong>silicone</strong>.</p>
                <table class="crit-table"><thead><tr><th>P/N</th><th>Pieza</th><th>Material</th></tr></thead><tbody>
                  <tr><td>007210020/034</td><td>Tramoggia valvola stellare</td><td>AISI 316L</td></tr>
                  <tr><td>035110100</td><td>Specola transparente</td><td>PMMA</td></tr>
                  <tr><td>007040071/072</td><td>Guarnizione / gasket</td><td>Silicone</td></tr>
                  <tr><td>035170550/551</td><td>Pettine rasatore</td><td>AISI 316L</td></tr>
                  <tr><td>035230011/012</td><td>Casetto largo, bicchiere</td><td>AISI 316L</td></tr>
                </tbody></table>
                <p>PDF: <code>MS235-Materiales-en-Contacto-Producto-S4220003-ITA-ENG.pdf</code></p>
              `
            },
            {
              id: "telerruptor-km444",
              title: "Contactor KM44.4 a fondo (alarma “Anomalía telerruptor”)",
              content: `
                <p><strong>KM44.4</strong> es el <strong>contactor general de seguridad de TODAS las resistencias de las planchas soldantes</strong>. El PLC solo lo cierra cuando se puede calentar; si manda cerrar y no recibe la confirmación, dispara la <strong>“Anomalía telerruptor”</strong>.</p>
                <p><strong>Componente:</strong> Siemens <strong>3RT2326-1BB40</strong> (4 polos, bobina 24 V DC) + diodo antiparasitario Siemens <strong>3RT2926-1ER00</strong>. Hoja <strong>44</strong> del plano (RISCALDAMENTO PIASTRE).</p>

                <h4>1) Potencia — lo que conmuta</h4>
                <ul>
                  <li><strong>Entra</strong> trifásica <code>2L1/2L2/2L3</code> (desde la <strong>hoja 22</strong>) por la bornera <code>X01</code>, cable 6 mm², a los polos <strong>1, 3, 5</strong>.</li>
                  <li><strong>Sale</strong> por <strong>2, 4, 6</strong> como <code>44L1/44L2/44L3</code> → bornera <code>X01</code> → <strong>hoja 19</strong> (plancha derecha: F19.1 10A y relés K19.1…K19.5) y <strong>hoja 19A</strong> (izquierda: F19A.1 y K19A.1…K19A.5) → conectores <code>X41/X42</code> → <strong>hoja 41</strong>, resistencias <code>R41.1.x</code> (dcha) y <code>R41.6.x</code> (izq).</li>
                </ul>

                <h4>2) Bobina — lo que lo hace cerrar</h4>
                <ul>
                  <li><strong>A1</strong> ← hilo <strong>4407</strong> ← PLC salida <strong>A12.9 / OUT 11</strong> (Beckhoff EL2809, byte 5 bit 2, “RESISTENZE INSERITE”).</li>
                  <li><strong>A2</strong> → 0 V (GND) del mando 24 V (vía <code>X06</code>, hoja 43).</li>
                  <li>Diodo <strong>3RT2926-1ER00</strong> en paralelo (rueda libre, suprime el pico al desconectar).</li>
                </ul>

                <h4>3) Realimentación — cómo el PLC sabe si cerró <span class="src-tag src-reco">aquí suele estar la falla</span></h4>
                <ul>
                  <li>24 V DC (vía <code>X06-3</code>, hoja 42) → contacto auxiliar <strong>NA 13-14</strong> → hilo <strong>4408</strong> → PLC entrada <strong>A12.4 / IN 2</strong> (Beckhoff EL1809, byte 4 bit 1, “CONTROLLO RESISTENZE”).</li>
                  <li>El PLC compara mando (OUT 11) vs retorno (IN 2). Si no coinciden a tiempo → <strong>Anomalía telerruptor</strong>.</li>
                </ul>

                <h4>4) Todos los contactos</h4>
                <table class="crit-table"><tbody>
                  <tr><th>Contacto</th><th>Tipo</th><th>Uso</th></tr>
                  <tr><td>1-2 / 3-4 / 5-6</td><td>Potencia</td><td>Conmuta la trifásica a las resistencias</td></tr>
                  <tr><td>7-8</td><td>Auxiliar</td><td>—</td></tr>
                  <tr><td><strong>13-14</strong></td><td>Aux. NA</td><td><strong>Realimentación → 4408 → PLC A12.4 IN2</strong></td></tr>
                  <tr><td>21-22</td><td>Aux. NC</td><td>—</td></tr>
                </tbody></table>

                <h4>5) Elementos relacionados (todo lo conectado)</h4>
                <ul>
                  <li>Borneras <code>X01</code> (potencia) y <code>X06</code> (24 V/GND); conectores <code>X41</code>/<code>X42</code>.</li>
                  <li>PLC Beckhoff: <code>A12.9</code> EL2809 (mando), <code>A12.4</code> EL1809 (feedback), <code>A12.11</code> PT100 (temperatura B41.4/B41.8).</li>
                  <li>Protecciones <code>F19.1</code>/<code>F19A.1</code> (Siemens 5SY6 10 A) y monitores de corriente <code>K19.x</code>/<code>K19A.x</code> (Weidmüller ACT20P).</li>
                  <li>Relés estáticos de calentamiento <code>A41.2</code>/<code>A41.6</code> (Omron G3PJ-525B 25 A).</li>
                  <li>Fuente de mando <code>G04.1</code> (Siemens SITOP 24 V/20 A) y general <code>Q01.3</code> (Siemens 3LD2504, 63 A).</li>
                </ul>

                <div class="alert-box" style="background:#eef4ff;border-color:#cdddff">👉 Usa la pestaña <strong>“Plano eléctrico”</strong> para navegar el esquema: selecciona KM44.4 y resalta todas sus conexiones, o pulsa <strong>“Trazar alarma telerruptor”</strong> para ver el lazo completo mando→contactor→feedback.</div>
              `
            }
          ],
          systems: [
            { name: "Alimentación de bobina y arrastre", function: "Desbobinar el film, guiarlo y arrastrarlo con tensión controlada. Incluye portabobinas neumático, freno y rodillos de reenvío.", components: ["Eje portabobinas S4A26100410 (Ø74, neumático)", "Freno y junta rotativa", "Rodillos de inversión S4A75100610", "Cinta de transporte S4A70200210", "Fotocélula lector de muesca S4M95100110"], status: "Manual p.114-126 consolidado" },
            { name: "Formado y foto-centrado", function: "Centrar la impresión del film (fotocélula) y posicionar el paso de sobres.", components: ["Fotocélula p.29 / p.86", "Rodillos de arrastre S4M121/S4A191", "Lámina de corte vertical", "Regulación de fase S4A12100110"], status: "Manual p.29-32 consolidado" },
            { name: "Dosificación volumétrica", function: "Alimentar el producto al sobre con dosificador volumétrico de doble cassette y estrella de alimentación. Optimizable por formato.", components: ["Cassette corto/largo S4G71500310/410 (4S00T)", "Estrella doble S4G72200210", "Placas de sellado S4M14100110", "Pettine rasatore 035170550/551 (AISI 316L)"], status: "Manual p.135-149 consolidado" },
            { name: "Corte y soldadura", function: "Cortar la banda y soldar longitudinal/transversalmente con mordazas calientes. Requiere fasatura y control de temperatura.", components: ["Grupo cuchillas S4A19100720 (fija + móvil)", "Placas soldantes S4M141", "Mordazas, membrana L=149, guías 007210020", "Resistencias R41 + KM44.4 + K19.x"], status: "Manual p.31-32 / p.71-81 consolidado" },
            { name: "Transporte y evacuación", function: "Evacuar los sobres formados y transportarlos hacia la salida / encajado.", components: ["Banda transportadora 6 sobres S4A191/S4M161", "Cadena S4M021/S4M161 (tensión/limpieza p.58-64)", "Rodamientos 6202/6001/6003/6300/608"], status: "Manual p.58-64 / p.108-123 consolidado" },
            { name: "Control eléctrico y neumático", function: "Gestionar HMI, PLC Beckhoff, variadores Lenze, seguridad y neumática.", components: ["HMI Siemens IPC477E 15\" + Basler GigE", "PLC Beckhoff EK1100 + EL1809/EL2809/EL6910 + AX8206/AX8620", "5× Lenze i550 0,37kW + SM safety", "Sensores SICK/Wenglor/Datalogic + Euchner CTP (p.127-134)", "Neumática SMC SY7120/SY5120 + cilindro S4A08100610"], status: "Esquema ES4220003 + Manual p.127-134" }
          ],
          systemAtlas: {
            title: "Vista general + desglose por sistemas (MS235)",
            description: "Lectura guiada: primero la máquina completa (plano B00), luego los 6 sistemas funcionales. Toca un sistema para ver su figura del manual, componentes clave, ajustes y diagnóstico. Las fases (fasature p.24-32) aplican a soldadura, fotocélula y cuchillas.",
            machineMap: {
              title: "Vista general de la MS235 — dibujo del catálogo de piezas Schmucker",
              description: "Cada punto está donde lo puso el fabricante: son las llamadas de grupo del catálogo S4220003, no posiciones aproximadas. Toca uno para ir a su sistema; en la pestaña <strong>Despiece</strong> están los 36 grupos con sus láminas y sus números de pieza.",
              image: { src: "assets/ms235/desp/mapa.jpg", alt: "MS235 — vista general con las llamadas de grupo", page: 20 },
              hotspots: [
                { label: "S4A19100110 · Arrastre de 6 sobres (3 puestos)", target: "transporte", x: 46.79, y: 43.76, w: 2.4, h: 1.8 },
                { label: "S4A26100920 · Correa del portabobinas", target: "alimentacion-bobina", x: 37.2, y: 59.43, w: 2.4, h: 1.8 },
                { label: "S4M95100110 · Fotocélula de lectura de muesca", target: "formado-fotocentrado", x: 37.0, y: 59.35, w: 2.4, h: 1.8 },
                { label: "S4A95100110 · Grupo A95 · control", target: "control", x: 61.11, y: 67.05, w: 2.4, h: 1.8 },
                { label: "S4M17100110 · Guías de desviación del papel", target: "formado-fotocentrado", x: 38.81, y: 47.41, w: 2.4, h: 1.8 },
                { label: "S4A27100110 · Guías de desviación del papel (2.ª línea)", target: "formado-fotocentrado", x: 36.66, y: 49.38, w: 2.4, h: 1.8 },
                { label: "S7A96100120 · Instalación eléctrica de la máquina", target: "control", x: 58.98, y: 68.16, w: 2.4, h: 1.8 },
                { label: "S4A71100310 · Juntas esféricas de mando", target: "transporte", x: 54.75, y: 47.82, w: 2.4, h: 1.8 },
                { label: "S4A19100720 · Mando de la cuchilla horizontal", target: "corte-soldadura", x: 46.79, y: 43.76, w: 2.4, h: 1.8 },
                { label: "S4M02100110 · Motor principal y cadena en baño de aceite", target: "transporte", x: 35.19, y: 57.63, w: 2.4, h: 1.8 },
                { label: "S3A95100310 · PC de la máquina y juntas", target: "control", x: 64.44, y: 34.69, w: 2.4, h: 1.8 },
                { label: "S4M15100110 · Placa de anclaje", target: "corte-soldadura", x: 46.17, y: 44.79, w: 2.4, h: 1.8 },
                { label: "S4M16100110 · Portabobina y empalme (cadena)", target: "alimentacion-bobina", x: 34.28, y: 70.35, w: 2.4, h: 1.8 },
                { label: "S4A26100410 · Portabobinas neumático D500 (eje D=74)", target: "alimentacion-bobina", x: 37.11, y: 74.16, w: 2.4, h: 1.8 },
                { label: "S4A75100610 · Rodillos de reenvío y desviación", target: "formado-fotocentrado", x: 44.98, y: 42.04, w: 2.4, h: 1.8 },
                { label: "S4A21100230 · Soldadura >118 (carro UL ATEX)", target: "corte-soldadura", x: 46.79, y: 43.76, w: 2.4, h: 1.8 },
                { label: "S4M14100110 · Soldadura del papel (placas y mordazas)", target: "corte-soldadura", x: 44.36, y: 43.07, w: 2.4, h: 1.8 },
                { label: "S4A12100110 · Toma de sobres y correa de motorización", target: "formado-fotocentrado", x: 37.2, y: 59.43, w: 2.4, h: 1.8 },
                { label: "S4G72200210 · Válvula estrella doble de dosificación", target: "dosificacion", x: 56.49, y: 49.55, w: 2.4, h: 1.8 }
              ]
            },
            systems: [
              { id: "alimentacion-bobina", name: "Alimentación de bobina y arrastre", kicker: "S4A261 / S4M161 / S4A702", station: "Sistema 1", page: 114, status: "Manual p.114-126", figure: { src: "assets/ms235/mec/c114.jpg", alt: "Portabobinas y arrastre", title: "Mantenimiento de los ejes neumáticos portabobinas", page: 114, caption: "Manual de Calibrado p.114 — ejes neumáticos Ø74 y dispositivo de frenado." }, summary: "Desbobina el film con tensión controlada y lo arrastra de forma sincronizada. La tensión de la cinta (p.120-121) y el desgaste de rodillos/rascadores determinan la calidad del arrastre.", flow: ["Bobina en eje S4A26100410 (Ø74, neumático, freno) → guías S4A75100610", "Cinta S4A70200210 tensa y centrada (p.120-121)", "Fotocélula lee muesca y corrige fase (p.86)", "Alimenta a formato/dosificación"], components: ["Eje portabobinas D74 + junta rotativa", "Rodillos reenvío S4A751", "Cinta + tensor/centrador p.121", "Fotocélula lector muesca S4M951"], adjustments: ["Tensión cinta p.120-121 (centrado)", "Frono portabobinas p.115", "Limpieza rodillos p.125", "Desgaste correa S4A26100920 p.117"], diagnostics: ["Si arrastra torcido → tensión/centrado p.121", "Si patina → rodillos S4A751 p.126 o correa", "Si lee mal muesca → limpiar objetivo fotocélula p.86"] },
              { id: "formado-fotocentrado", name: "Formado y foto-centrado", kicker: "S4M951 / S4M121 / S4A121", station: "Sistema 2", page: 29, status: "Manual p.29 / 65-91", figure: { src: "assets/ms235/mec/c086.jpg", alt: "Formado y fotocélula", title: "Limpieza del objetivo de la fotocélula de muesca", page: 86, caption: "Manual de Calibrado p.86 — la fotocélula que centra la impresión." }, summary: "Asegura que el film imprima centrado y que el paso coincida con corte/soldadura. Requiere fasatura.", flow: ["Lectura de muesca por fotocélula S4M951 p.29", "Arrastre S4M121/S4A191 posiciona el paso", "Regulación fase toma sobres S4A12100110 p.28", "Verificación tras cambio de formato"], components: ["Fotocélula centrado impresión p.29", "Rodillos arrastre carta p.69/96", "Cuchilla/rodillos lámina vertical p.70/97"], adjustments: ["Fase prelievo buste S4A121 p.28 (regulador numérico/pomello p.20)", "Verificación rulos de arrastre p.69", "Limpieza objetivo fotocélula p.86"], diagnostics: ["Descentrado → ajustar fase p.28 y limpiar fotocélula", "Paso irregular → revisar desgaste rulos p.69"] },
              { id: "dosificacion", name: "Dosificación volumétrica", kicker: "S4G715 / S4G722", station: "Sistema 3", page: 135, status: "Manual p.135-149", figure: { src: "assets/ms235/mec/c135.jpg", alt: "Dosificación MS235", title: "Alimentación de producto — dosificador de cassette", page: 135, caption: "Manual de Calibrado p.135 — movimientos de dosificación, muelles y rasador." }, summary: "Dosifica el producto en cada sobre. El catálogo 5-Piezas + materiales en contacto (AISI 316L/PMMA/silicone) detallan lo que toca producto.", flow: ["Tramoggia superior valvola stellare 007210020 (AISI 316L)", "Pettine rasatore 035170550/551 → nivelación", "Cassette S4G71500310/410 → transición bicchiere 035230034", "Estrella doble S4G722 → entrega al sobre"], components: ["Cassette corto/largo S4G715 + estrella S4G722", "Tramoggie 035230049/050/074 (316L) + guarnizione silicone 007040071", "Pettine, specola PMMA 035110100"], adjustments: ["Movimentazione dosatore S4G715 p.29/31 (cambio formato)", "Limpieza movimientos dosaggio p.136/142", "Limpieza asp. polvo p.140/146", "Verificación molle/rasatore p.138-139"], diagnostics: ["Variación peso → limpiar movimientos, verificar molle/rasatore p.138-139", "Polvo → limpiar aspiradores p.140/146", "Obstrucción → revisar valvola stellare y tubos sensor 035080150"] },
              { id: "corte-soldadura", name: "Corte y soldadura", kicker: "S4A19100720 / S4M141", station: "Sistema 4", page: 31, status: "Manual p.31-32 / 71-81", figure: { src: "assets/ms235/mec/c071.jpg", alt: "Corte y soldadura", title: "Engrasado de las placas soldadoras", page: 71, caption: "Manual de Calibrado p.71 — placas, mordazas y membrana del grupo de soldadura." }, summary: "Corta y suelda el film. Requiere fasatura precisa y membranas/mordazas en buen estado. Es donde actúa KM44.4 (planchas).", flow: ["Fasatura cuchilla horizontal S4A19100720 p.31-32", "Verificación posición p.31 / ripristino p.32", "Placas soldantes S4M141 + membrana larga L=149", "Resistencias R41 supervisadas por K19.x → KM44.4"], components: ["Cuchilla fija 235.15.222 + móvil 235.15.330 + rodillos A92R800005/006", "Placas 035180143 + BLOCK guida ganasce 007210121/125 + membrana", "Resistencias R41.1.x/R41.6.x + K19.x/K19A.x (Weidmüller) + KM44.4"], adjustments: ["Distancia cuchilla fija-móvil p.102", "Fasatura cuchilla horizontal p.31-32", "Ingrassaggio piastre p.71 + smontaggio ganasce p.72", "Controllo precarico tiranti p.79"], diagnostics: ["Corte irregular → verificar filo cuchilla p.98/100 y distancia p.102", "Sellado frío → verificar membrana/filtro aire p.73 y corriente K19.x / KM44.4", "Desajuste fase → refasare S4A19100720"] },
              { id: "transporte", name: "Transporte y evacuación", kicker: "S4M021 / S4M161 / S4A702", station: "Sistema 5", page: 58, status: "Manual p.58-64 / 108-123", figure: { src: "assets/ms235/mec/c058.jpg", alt: "Transporte MS235", title: "Control de la tensión de la cadena", page: 58, caption: "Manual de Calibrado p.58 — cadena del motor principal, máx. 20 mm de desplazamiento." }, summary: "Mueve los sobres formados. La cadena y la cinta requieren tensión, limpieza y control de desgaste.", flow: ["Cadena S4M021 (tensión p.58, limpieza p.59, filtro/aceite p.60-64)", "Banda 6 sobres S4A191/S4M161 (p.83-84)", "Cinta S4A702 (tensión p.120, nastro p.119-123)"], components: ["Cadena + filtro DROPSA 3088055 + pompa 3099127", "Cinta/nastro + rulli S4A702/S4A711", "Rodamientos 6202/6001/6003 (stock Excel)"], adjustments: ["Tensión cadena p.58/84", "Tensión y centratura nastro p.121", "Pulizia vasca superiore p.64 / guide p.82", "Cambio olio p.61-62"], diagnostics: ["Ruido/cadena floja → verificar tensión p.58/84 y nivel aceite p.63", "Banda desalineada → centratura nastro p.121", "Atasco transporte → limpiar guide carta p.85/118"] },
              { id: "control", name: "Control eléctrico y neumático", kicker: "S3E01052 / S4A961 / SMC", station: "Sistema 6", page: 127, status: "Esquema ES4220003 + p.127-134", figure: { src: "assets/ms235/mec/c127.jpg", alt: "Armario MS235", title: "Sistema eléctrico — mantenimiento", page: 127, caption: "Manual de Calibrado p.127 — revisión de la instalación eléctrica." }, summary: "Cerebro 24V DC: HMI + Beckhoff + Lenze + seguridad. Todo trazable en el esquema ES4220003.", flow: ["230V→SITOP 20A (G04.1) → 24V a EL9410/EL2809/EL1809/EL6910", "EK1100 EtherCAT → 5× i550 (0,37kW) + AX8206/AX8620", "Entradas: SICK/Wenglor/Datalogic + Euchner CTP", "Salidas: K19.x, A41.2/A41.6 (G3PJ), KM44.4 + SMC SY7120/5120"], components: ["IPC477E 15\" + Basler GigE 4p PoE", "Beckhoff EL9410/EL1014/EL1809/EL2809/EL3162/EL6910/AX8206", "SITOP, 3LD2504, 5SY6, ELM-4F/10F (Weidmüller)", "SMC SY7120/SY5120 + cilindro CDM2E20-50A, giunti sferici S4A081"], adjustments: ["Sostituzione preventiva eléctrica p.134", "Verifica giunti sferici S4A081 p.89/124", "Pulizia filtro/vasca p.60-64"], diagnostics: ["Alarma telerruptor → OUT11 vs IN2 (KM44.4) p.44", "Fallo servo → Lenze i550 + AX8206", "Neumática → verificar electroválvulas SMC y cilindro p.90"] }
            ]
          },
          spareParts: [
            { name: "Contactor KM44.4 (resistencias de planchas)", system: "Eléctrico / Soldadura", type: "Contactor", criticality: "Alta", reference: "Siemens 3RT2326-1BB40 · 4P · bobina 24VDC", function: "Contactor general que habilita la trifásica de las resistencias de las planchas." },
            { name: "Diodo antiparasitario de KM44.4", system: "Eléctrico / Soldadura", type: "Componente", criticality: "Media", reference: "Siemens 3RT2926-1ER00", function: "Rueda libre sobre la bobina; suprime el pico de apertura." },
            { name: "Magnetotérmico resistencias (dcha / izq)", system: "Eléctrico / Soldadura", type: "Protección", criticality: "Media", reference: "Siemens 5SY6 2 10-6 (10A) — F19.1 / F19A.1", function: "Protege las resistencias de cada plancha." },
            { name: "Monitor de corriente de resistencias", system: "Eléctrico / Soldadura", type: "Relé/monitor", criticality: "Media", reference: "Weidmüller ACT20P-CML-10-AO-RC-P — K19.x / K19A.x", function: "Controla la corriente de cada resistencia; feedback a A12.5.1." },
            { name: "Relé estático de calentamiento (dcha / izq)", system: "Eléctrico / Soldadura", type: "Relé estático", criticality: "Media", reference: "Omron G3PJ-525B (25A) — A41.2 / A41.6", function: "Modula el calentamiento de cada plancha (mando A12.9 OUT6/OUT7)." },
            { name: "Módulo PLC salidas (mando KM44.4)", system: "Eléctrico / Control", type: "Módulo PLC", criticality: "Alta", reference: "Beckhoff EL2809 (16 OUT) — A12.9", function: "OUT11 (hilo 4407) comanda la bobina de KM44.4." },
            { name: "Módulo PLC entradas (feedback KM44.4)", system: "Eléctrico / Control", type: "Módulo PLC", criticality: "Alta", reference: "Beckhoff EL1809 (16 IN) — A12.4", function: "IN2 (hilo 4408) lee la realimentación de KM44.4." },
            { name: "Fuente de mando 24 V DC", system: "Eléctrico / Control", type: "Fuente", criticality: "Alta", reference: "Siemens SITOP 24V/20A — G04.1", function: "Alimenta todo el mando 24 V DC (incl. bobina de KM44.4)." },
            { name: "Interruptor general", system: "Eléctrico / Control", type: "Seccionador", criticality: "Alta", reference: "Siemens 3LD2504 · 3P · 63A — Q01.3", function: "Corte general de potencia (punto de LOTO)." },
            { name: "Variador de motores", system: "Motriz / Control", type: "Variador", criticality: "Alta", reference: "Lenze i550 0,37 kW (×5) — A29.1/A34.1/A34A.1/A37.1/A96A.1", function: "Acciona motores (svolgitura/trascinamento carta, vibrador, transporte)." },
            { name: "Rodamiento aguja HK2020 (sellado)", system: "Sellado", type: "Rodamiento", criticality: "Media", reference: "741907025 · HK2020 · q24", function: "Plan Excel MS235 — SELLADO MECANICA. Unifica código interno + referencia. Buscable por 741907025." },
            { name: "Rodamiento lineal KH2540 (sellado)", system: "Sellado", type: "Buje lineal", criticality: "Media", reference: "741903029 · KH2540 · q12 e16", function: "Plan Excel — SELLADO. Ub. R04/E0104." },
            { name: "Arandela calibrada 17×30×1 (sellado)", system: "Sellado", type: "Arandela", criticality: "Baja", reference: "742902038 · DIA INT17 EXT30 · q24", function: "Plan Excel — SELLADO." },
            { name: "Rodamiento bola 6202 ZZ (banda)", system: "Banda transportadora", type: "Rodamiento", criticality: "Media", reference: "741901003 · 6202 ZZ · q2 e16", function: "Plan Excel — BANDA TRANSPORTADORA MECANICA. Ub. R01/Z0505." },
            { name: "Rodamiento axial ZKLF2068-2RS (foil)", system: "Foil", type: "Rodamiento", criticality: "Alta", reference: "741903157 · ZKLF2068-2RS · q2 e8", function: "Plan Excel — FOIL. Pu 2757724." },
            { name: "Seguidor leva KR30-PP (foil)", system: "Foil", type: "Seguidor leva", criticality: "Media", reference: "741909011 · KR30-PP · q8", function: "Plan Excel — FOIL." },
            { name: "Retenedor 25×35×4 aceite (dosificación)", system: "Dosificación", type: "Retén", criticality: "Media", reference: "741902042 · 25×35×4 · q8", function: "Plan Excel — DOSIFICACION MECANICA." },
            { name: "Rodamiento axial 51104 20×35×10 (sellado)", system: "Sellado", type: "Rodamiento", criticality: "Media", reference: "741903137 · NACHI 51104 · q4", function: "Plan Excel — SELLADO. 6M." },
            { name: "Rodamiento bola 6001 ZZ (sellado)", system: "Sellado", type: "Rodamiento", criticality: "Media", reference: "741901027 · 6001 ZZ · q6 e3", function: "Plan Excel — SELLADO. Ub. R04/B0204." },
            { name: "Rodamiento bola 6300 ZZ (dosificación)", system: "Dosificación", type: "Rodamiento", criticality: "Media", reference: "741901021 · 6300 ZZ · q2 e29", function: "Plan Excel — DOSIFICACION. Ub. R04/B0204–R02/M0203." },
            { name: "Rodamiento bola 608 ZZ (dosificación)", system: "Dosificación", type: "Rodamiento", criticality: "Media", reference: "741901135 · 608 ZZ · q10 e20", function: "Plan Excel — DOSIFICACION. Ub. R01/Z0505." },
            { name: "Rodamiento bola 6003 2RS (banda)", system: "Banda transportadora", type: "Rodamiento", criticality: "Media", reference: "741901079 · 6003 2RS · q3", function: "Plan Excel — BANDA 6M. Sin stock hoy." },
            { name: "Bomba DROPSA 0,35L (cadena)", system: "Cadena / Lubricación", type: "Bomba", criticality: "Alta", reference: "3099127 · P02P010010 · q1 (lista 2a)", function: "Catálogo 5-Piezas S4M021 + Lista 2a. Lubricación cadena p.58-64." },
            { name: "Filtro DROPSA (cadena)", system: "Cadena / Lubricación", type: "Filtro", criticality: "Media", reference: "3088055 · P02P011001 · q4 (lista 2a)", function: "Filtro lubricación cadena." },
            { name: "Correa dentada 124 L075 Gomma Nera", system: "Transmisión", type: "Correa", criticality: "Media", reference: "C261124075 · q4", qty: 1, function: "Lista 2a S4M121 — transmisión rulos." },
            { name: "Cuchilla vertical STGR.LAMA + cuchilla", system: "Corte", type: "Cuchilla", criticality: "Alta", reference: "32940130 + 235.15.222/235.15.330 · q1+5", qty: 1, function: "Grupo S4A19100720 — lámina corte vertical p.70/97." },
            { name: "Membrana larga L=149 (mordazas)", system: "Soldadura", type: "Membrana", criticality: "Media", reference: "007210121/007210125 · L=149 · q1", qty: 2, function: "S4M141 — membrana mordazas soldantes, cambio con ingrassaggio p.72-74." },
            { name: "Filtro aire descarga + junta", system: "Soldadura / Neumática", type: "Filtro", criticality: "Media", reference: "C93-GACO DEM32A+P + AA103 D17-30", function: "S4M141 p.73 — filtro descarga aire + guarnizione ATP." },
            { name: "Correa dentada 700 RPP5 25 (válvula)", system: "Transmisión / Válvula", type: "Correa", criticality: "Media", reference: "C26Q050700 · 700-RPP5-25", function: "Lista 2a S4G722 — estrella alimentación." },
            { name: "Rodamiento INOX 6903H-ZZ EZO (QE1)", system: "Eléctrico", type: "Rodamiento", criticality: "Baja", reference: "6903H-ZZ INOX · q4 (lista 2a)", function: "Lista 2a QE1 S3E01052 — rod específico inox." },
            { name: "Rodillo traccion", system: "Arrastre de papel", type: "Rodillo", criticality: "Media", reference: "A92R800006 · RULLO DI TRASC.ESTERNO", qty: 4, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M12100110. Cantidad sugerida para 2 años: 4." },
            { name: "Kit junta", system: "Arrastre de papel", type: "Junta / membrana", criticality: "Media", reference: "C85997005019 · KIT GIUNTO KG5.019 VARVEL", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M12100110. Cantidad sugerida para 2 años: 1." },
            { name: "Tornillo", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "035210387 · VITE PER LEVA BIELLA", qty: 4, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 4." },
            { name: "Tornillo x sujeccion membrana", system: "Soldadura", type: "Junta / membrana", criticality: "Alta", reference: "17P10124 · VITE PER PORTA MENBRANA", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 2." },
            { name: "Arandela distanciador", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "17P10125 · RONDELLA DISTANZIALE", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 2." },
            { name: "Eje mando", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "235.21.228 · ALBERO COMANDO", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 2." },
            { name: "Cubrepolvo", system: "Soldadura", type: "Repuesto", criticality: "Media", reference: "235.21.544 · SOFFIETTI CIRCOLARI DISEGNO", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 2." },
            { name: "Eje", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "A014003016 · ALBERO TEMPR.D.16 L. 30FINITO", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 2." },
            { name: "Anillo de sellado", system: "Soldadura", type: "Junta / membrana", criticality: "Media", reference: "C482202804 · ANELLO DI TENUTA GR20 X 28 X 4 INA", qty: 6, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 6." },
            { name: "Anillo de sellado", system: "Soldadura", type: "Junta / membrana", criticality: "Media", reference: "C482253504 · ANELLO DI TENUTA GR25 X 35 X 4 INA", qty: 4, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 4." },
            { name: "Junta", system: "Soldadura", type: "Junta / membrana", criticality: "Media", reference: "P390243206 · GUARNIZIONE GACO DEM 32 A+P", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4M14100110. Cantidad sugerida para 2 años: 2." },
            { name: "Grupo de lámina para cuchilla vertical (STGR.LAMA)", system: "Corte", type: "Cuchilla", criticality: "Alta", reference: "00711R011 · STGR.LAMA x COLTELLO VERTICALE", qty: 0, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100110. Cantidad sugerida para 2 años: sin dato." },
            { name: "Eje roscado", system: "Transporte", type: "Mecanizado", criticality: "Media", reference: "235.20.352 · PERNO", qty: 5, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100110. Cantidad sugerida para 2 años: 5." },
            { name: "Limpia cuchillas", system: "Transporte", type: "Cuchilla", criticality: "Alta", reference: "235.20.354 · FELTRO PULIZIA LAMA", qty: 5, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100110. Cantidad sugerida para 2 años: 5." },
            { name: "Rodillo interno", system: "Transporte", type: "Rodillo", criticality: "Media", reference: "A92R800001 · RULLO DI TRASCINAMENTO INTER.", qty: 10, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100110. Cantidad sugerida para 2 años: 10." },
            { name: "Rodillo contraste vertical", system: "Transporte", type: "Rodillo", criticality: "Media", reference: "A92R800002 · RULLO CONTRASTO VERT.", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100110. Cantidad sugerida para 2 años: 2." },
            { name: "Rodillo contraste preinc.", system: "Transporte", type: "Rodillo", criticality: "Media", reference: "A92R800005 · RULLO CONTRASTO PREINC.", qty: 3, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100110. Cantidad sugerida para 2 años: 3." },
            { name: "Pasador cilindrico", system: "Transporte", type: "Mecanizado", criticality: "Media", reference: "V700006012 · SPINE CILINDR. 6 X 12 H8 UNI 1707", qty: 14, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100110. Cantidad sugerida para 2 años: 14." },
            { name: "Cuchilla fija", system: "Corte", type: "Cuchilla", criticality: "Alta", reference: "235.15.222 · COLTELLO", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100720. Cantidad sugerida para 2 años: 1." },
            { name: "Cuchilla movil", system: "Corte", type: "Cuchilla", criticality: "Alta", reference: "235.15.330 · COLTELLO MOBILE", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A19100720. Cantidad sugerida para 2 años: 1." },
            { name: "Membrana larga l=149", system: "Soldadura", type: "Junta / membrana", criticality: "Alta", reference: "007050268 · MEMBRANA LARGA L=149", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A21100230. Cantidad sugerida para 2 años: 1." },
            { name: "Casquillo", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "007210125 · BOCCOLA DI SCORRIMENTO", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A21100230. Cantidad sugerida para 2 años: 2." },
            { name: "Placa", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "035180143 · PIASTRA ISOLANTE 131X416", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A21100230. Cantidad sugerida para 2 años: 1." },
            { name: "Espesor para placa", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "16910005 · SPESSORE PER PIASTRA", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A21100230. Cantidad sugerida para 2 años: 2." },
            { name: "Pasador cil. 8x30esa 6364", system: "Soldadura", type: "Mecanizado", criticality: "Media", reference: "V703008030 · SPINE CIL.RIF.UNI 6364-68 8 X 30 ESEC.A", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A21100230. Cantidad sugerida para 2 años: 2." },
            { name: "Anillo", system: "Alimentación de bobina", type: "Junta / membrana", criticality: "Media", reference: "C622207000 · ANELLO ATTRITO LS70 COD.20 011#005/00 DESERTI", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4A26100410. Cantidad sugerida para 2 años: 2." },
            { name: "Rodamiento especial", system: "Dosificación", type: "Rodamiento", criticality: "Media", reference: "271.01.512 · CUSCINETTO SPECIALE", qty: 10, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4G71500310. Cantidad sugerida para 2 años: 10." },
            { name: "Junta aa103 d.17-30 atp", system: "Dosificación", type: "Junta / membrana", criticality: "Media", reference: "007040097 · GUARNIZIONE AA103 D.17-30 ATP", qty: 4, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4G72200210. Cantidad sugerida para 2 años: 4." },
            { name: "Stgr. junta valvula", system: "Dosificación", type: "Junta / membrana", criticality: "Media", reference: "00704R008 · STGR.GUARNIZIONI OR VALVOLA", qty: 2, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4G72200210. Cantidad sugerida para 2 años: 2." },
            { name: "Correa dentada", system: "Dosificación", type: "Correa", criticality: "Media", reference: "C26Q051270 · CINGHIA DENTATA 1270-RPP5-25", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S4G72200210. Cantidad sugerida para 2 años: 1." },
            { name: "Zocalo pyf 08a omron Omron PYFZ-08", system: "Eléctrico / Armario QE1", type: "Conexionado", criticality: "Baja", reference: "D972571081 · ZOCCOLO PYFZ-08 OMRON (EX. PYF 08A)", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Zocalo para rele' Omron (G7SA-4A2B)", system: "Eléctrico / Armario QE1", type: "Maniobra / protección", criticality: "Baja", reference: "D974571060 · ZOCCOLO X RELE' DI SICUREZZA (G7SA-4A2B) P7SA-14F OMRON", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Filtro Finmotor FIN1740ESM.0.36.MN", system: "Eléctrico / Armario QE1", type: "Filtro", criticality: "Media", reference: "E3042F006311 · FILTRO FIN1740ESM.0.36.MN 36AMP FINMOTOR", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Proteccion electronica Weidmuller ELETTR.24", system: "Eléctrico / Armario QE1", type: "Maniobra / protección", criticality: "Media", reference: "E34695107040 · PROTEZIONE ELETTR.24 VDC 4 A CL.2 AMG ELM-4F CL2 WEIDMULLER", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Protecciion electronica", system: "Eléctrico / Armario QE1", type: "Maniobra / protección", criticality: "Media", reference: "E34695107100 · PROTEZIONE ELETTRONICA 24 VDC 10 A AMG ELM-10F WEIDMULLER", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Abrazadera Weidmuller", system: "Eléctrico / Armario QE1", type: "Conexionado", criticality: "Baja", reference: "E34995000000 · MORSETTO DISTRIBUZ.PER PROT.ELETTR.AMG FIM-C WEIDMULLER", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Relé auxiliar Omron MY2-ND2 24 V DC", system: "Eléctrico / Armario QE1", type: "Maniobra / protección", criticality: "Media", reference: "E72157322400 · RELE' MY2-ND2 24V DC OMRON", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Relé estático Weidmüller RSO30/DV 5-24 V", system: "Eléctrico / Armario QE1", type: "Maniobra / protección", criticality: "Media", reference: "E72795052400 · RELE' ST.RSO30/DV 5-24V CC/SC 9443100000(EX.RSM01)WEIDMULLER", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Monitor de corriente Weidmüller ACT20P-CML-10-AO-RC-P (resistencias)", system: "Eléctrico / Armario QE1", type: "Maniobra / protección", criticality: "Media", reference: "E72895515301 · RELE' CTRL CORR.ACT20P-CML-10-AO-RC-P 2489910000 WEIDMULLER", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Módulo de seguridad Omron G7SA-4A2B (24 V DC, 4NA+2NC)", system: "Eléctrico / Armario QE1", type: "Módulo / electrónica", criticality: "Media", reference: "E72A57092300 · MODULO DI SICUREZZA 24VDC 4NA+2NC G7SA-4A2B OMRON", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Tarjeta accionamiento MOD.PLN19-8+SUPP.GUIDA", system: "Eléctrico / Armario QE1", type: "Módulo / electrónica", criticality: "Media", reference: "E79205T59400 · AZIONAMENTO PER MOTORI C.C. MOD.PLN19-8+SUPP.GUIDA DIN", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Teclado Lenze I5MADK0000000S", system: "Eléctrico / Armario QE1", type: "Módulo / electrónica", criticality: "Alta", reference: "E79334F00001 · TASTIERINO PER INVERTER SERIE I550 I5MADK0000000S LENZE", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Tarjeta de variador Lenze i550 230 V 0,37 kW", system: "Eléctrico / Armario QE1", type: "Módulo / electrónica", criticality: "Alta", reference: "E79334F40230 · SCHEDA INVERTER I550 230V 0,37KW I5DAE137B10V10000S LENZE", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Tarjeta I/O de variador Lenze i550", system: "Eléctrico / Armario QE1", type: "Módulo / electrónica", criticality: "Alta", reference: "E79624F00002 · SCHEDA I/O INVERTER I55016064350 I5CA5002000VA0000S LENZE", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Tarjeta safety Lenze I5MASAV000000S", system: "Eléctrico / Armario QE1", type: "Módulo / electrónica", criticality: "Alta", reference: "E79724F00000 · SCHEDA SAFETY INVERTER I550 SM PU01 I5MASAV000000S LENZE", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052010. Cantidad sugerida para 2 años: 1." },
            { name: "Conector Phoenix SACC-M12FR-4CON-PG7", system: "Eléctrico / Sensores y conexionado", type: "Conexionado", criticality: "Baja", reference: "E20055105040 · CONN.FEMM. 90° 1681130 SACC-M12FR-4CON-PG7 PHOENIX", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Conector Phoenix SACC-M12FS-4CON-PG7", system: "Eléctrico / Sensores y conexionado", type: "Conexionado", criticality: "Baja", reference: "E20055105041 · CONN.FEMM.DIRITTO 1681114 SACC-M12FS-4CON-PG7 PHOENIX", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Conector Phoenix M12 4 polos con cable 10 m (1681389)", system: "Eléctrico / Sensores y conexionado", type: "Conexionado", criticality: "Baja", reference: "E20661789040 · CONN.UL/CSA M12 10mt 4POLI 1681389 PHOENIX", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Conector Phoenix CUC-I-D1ZNI-S/R4GC8", system: "Eléctrico / Sensores y conexionado", type: "Conexionado", criticality: "Baja", reference: "E20A61010000 · CONNETTORE FEMMINA CUC-I-D1ZNI-S/R4GC8 1041760 PHOENIX", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Cable de red apantallado 0,5 m (DK1644A005)", system: "Eléctrico / Sensores y conexionado", type: "Conexionado", criticality: "Baja", reference: "E20A6G509080 · CAVO RETE 0.5M S-FTP DOPPIA SCHERMAT.LSOH DK1644A005 DIGITUS", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Cable de red apantallado 5 m (DK1644A050)", system: "Eléctrico / Sensores y conexionado", type: "Conexionado", criticality: "Baja", reference: "E20A6G509084 · CAVO RETE 5MT S-FTP DOPPIA SCHERMAT.LSOH DK1644A050 DIGITUS", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Cable de red apantallado 10 m (DK1644A100)", system: "Eléctrico / Sensores y conexionado", type: "Conexionado", criticality: "Baja", reference: "E20A6G509085 · CAVO RETE 10MT S-FTP DOPPIA SCHERMAT.LSOH DK1644A100 DIGITUS", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Led fl amarillo 24v", system: "Eléctrico / Sensores y conexionado", type: "Repuesto", criticality: "Baja", reference: "E264240040 · DIODI LED TIPO FL GIALLO 24V OMEGA", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Interruptor de seguridad Euchner CTP-I-AP-U-HA-ZZ-SA-136732", system: "Eléctrico / Sensores y conexionado", type: "Maniobra / protección", criticality: "Media", reference: "E31072580001 · INTER.SICUR.EUCHNER CTP-I-AP-U-HA-ZZ-SA-136732 EUC-136732", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Tope Euchner CONT.CES-I-AP-U-C04-SK", system: "Eléctrico / Sensores y conexionado", type: "Repuesto", criticality: "Baja", reference: "E31092500001 · FINECORSA RFID SENZA CONT.CES-I-AP-U-C04-SK 115324 EUCHNER", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Actuador para micro Euchner CES-A-BBN-C04", system: "Eléctrico / Sensores y conexionado", type: "Repuesto", criticality: "Media", reference: "E31952500001 · ATT.RFID CES-A-BBN-C04 115271 SENZ.CONTAT.EUCHNER NR12+STER.", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Amplificador para fibra óptica Takex F71RAN 24 V DC (centrado automático)", system: "Formado y foto-centrado", type: "Sensor", criticality: "Media", reference: "E32077F31200 · AMPLIFICATORE PER FIBRA OTT.F71RAN 24V DC (EX F1RAN) SEEKA", qty: 1, function: "Va en 1 posición de la máquina — B31.10 (Portabobinas y centrado), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: sin dato." },
            { name: "Lector de muescas Datalogic TLMICRO115", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Media", reference: "E32081924244 · LETTORE TACCHE PNP TLMICRO115 DATALOGIC", qty: 1, function: "Va en 1 posición de la máquina — B30.10 (Arrastre de papel), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Fotocélula láser Wenglor YM22PA2 (control expulsión)", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Alta", reference: "E32099824230 · FOTO.LASER YM22PA2 PNP WENGLOR", qty: 3, function: "Va en 3 posiciones de la máquina — B52.1, B52.2, B52.3 (Expulsion / rechazo), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Fotocélula supresión de fondo Wenglor P1KH002 (control bobina)", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Media", reference: "E32139824211 · FOT.LUCE ROSSA SOPPRESSIONE DI SFONDO P1KH002 150 mm WENGLOR", qty: 1, function: "Va en 1 posición de la máquina — B29.8 (Bobina y desbobinado), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Fotocélula de horquilla ultrasónica Sick UFN3-70B413 (empalme de bobina)", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Media", reference: "E32157C44210 · FOT.FORCELLA ULTRAS.UFN3-70B413 6049678 SICK", qty: 1, function: "Va en 1 posición de la máquina — B29.9 (Bobina y desbobinado), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Fibra óptica de centrado automático", system: "Formado y foto-centrado", type: "Sensor", criticality: "Media", reference: "E32987F00000 · TAKEX FTL 716 BC", qty: 1, function: "Fibra del amplificador TAKEX F71RAN (B31.10) que hace el centrado automático de la bobina." },
            { name: "Detector inductivo Selet B0281POV6 (portabobinas)", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Media", reference: "E66075212310 · PROXIMITY B0281POV6 (ex B8/1 V2) SELET", qty: 2, function: "Va en 2 posiciones de la máquina — B31.8, B31.9 (Portabobinas y centrado), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Detector inductivo Selet B60122POC5 (el más usado de la máquina)", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Alta", reference: "E66075212523 · PROXIMITY B60122POC5 B12 PNP-UL SELET", qty: 13, function: "Va en 13 posiciones de la máquina — B18.2, B18.3, B25.8, B29.6, B29.7, B31.7, B32.8, B40.1, B40.2, B40.8, B42.2, B42.5, B42.6 (Bobina y desbobinado, Cierre de planchas, Corte de papel, Motor principal, Planchas soldantes, Portabobinas y centrado, Soldadura y dosis), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Sensor capacitivo de nivel Rechner KAS 80-A12-AK (carga máxima)", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Media", reference: "E66163212580 · PROXIMITY KAS 80-A12-AK PTFE COD.KA0142 RECHNER", qty: 2, function: "Va en 2 posiciones de la máquina — B35.4, B35A.4 (Dosificacion, Dosificacion (2.o cassette)), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Sensor capacitivo de nivel Rechner KAS 80-26-A 1\" (carga mínima)", system: "Eléctrico / Sensores y conexionado", type: "Sensor", criticality: "Media", reference: "E66163212960 · PROXIMITY KAS 80-26-A PTFE 1\" COD.813100 RECHNER", qty: 2, function: "Va en 2 posiciones de la máquina — B35.1, B35A.1 (Dosificacion, Dosificacion (2.o cassette)), según el esquema ES4220003. Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052100. Cantidad sugerida para 2 años: 1." },
            { name: "Tarjeta de red Basler", system: "Eléctrico / Mandos y neumática", type: "Módulo / electrónica", criticality: "Media", reference: "E79620W00000 · SCHEDA DI RETE A 4 PORTE GIGE POE BASLER AT ADVANCED", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052210. Cantidad sugerida para 2 años: 1." },
            { name: "Transformador 208-240/400V", system: "Eléctrico / Mandos y neumática", type: "Alimentación", criticality: "Alta", reference: "E89325N16300 · TRAFO D/YN 208-240/400V 6.4KVA ULCSA", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052210. Cantidad sugerida para 2 años: 1." },
            { name: "Electroválvula SMC SY7120 5/2 1/4\" 24 V DC", system: "Eléctrico / Mandos y neumática", type: "Neumática", criticality: "Media", reference: "P258G05014 · ELETTROV.5/2 1/4\" SY7120-5YO-02F-Q 24V.CC SMC", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052210. Cantidad sugerida para 2 años: 1." },
            { name: "Microfiltro Smc SC.AUT.AFM30-F03-D-A", system: "Eléctrico / Mandos y neumática", type: "Filtro", criticality: "Media", reference: "P332560038 · MICROFILTRO ARIA SC.AUT.AFM30-F03-D-A 3/8\" SMC", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052210. Cantidad sugerida para 2 años: 1." },
            { name: "Electroválvula SMC SY5120 5/2 1/8\" 24 V DC", system: "Eléctrico / Mandos y neumática", type: "Neumática", criticality: "Media", reference: "P258E05006 · ELETTROV.5/2 1/8\"T6 SY5120-5Y0-C6F-Q 24V CC SMC", qty: 1, function: "Lista de recambios recomendada 2 años (lista n.36, 05/05/2023) — grupo S3E01052210. Cantidad sugerida para 2 años: 1." },
            { name: "Sonda de temperatura PT100 de plancha", system: "Soldadura", type: "Sensor", criticality: "Alta", reference: "D7911B600650 · CREI PT100 MOD.500 D.6×50 LC=2000 2 hilos cód.00649", qty: 2, function: "Va en 2 posiciones de la máquina — B41.4, B41.8 (Temperatura de planchas), según el esquema ES4220003. Mide la temperatura de cada plancha soldante — B41.4 (derecha) y B41.8 (izquierda) del esquema ES4220003. Sin ella el PLC no habilita KM44.4." }
          ],
          maintenanceTasks: [
            { name: "Verificación tensión cadena", system: "Cadena (S4M021)", frequency: "Semanal", type: "Inspección", acceptance: "Tensión según p.58 — sin flecha ni ruido. Pulizia p.59." },
            { name: "Limpieza cadena + sustitución filtro y cambio aceite", system: "Cadena (S4M021)", frequency: "Mensual", type: "Limpieza/Reemplazo", acceptance: "Filtro DROPSA limpio/sustituido p.60, aceite cambiado p.61-62, nivel p.63, vasca p.64." },
            { name: "Verificación desgaste rulos arrastre carta + lámina corte vertical", system: "Arrastre (S4M121/S4A191)", frequency: "Mensual", type: "Inspección", acceptance: "Rulos sin desgaste p.69/96, lámina eficiente p.70/97." },
            { name: "Ingrassaggio piastre soldanti + mordazas (grasa interna)", system: "Soldadura (S4M141)", frequency: "Mensual", type: "Lubricación", acceptance: "Engrase p.71, smontaggio ganasce p.72, filtro aire p.73, membrana p.74." },
            { name: "Control precarico tiranti molleggiati + snodi", system: "Soldadura (S4M141)", frequency: "Trimestral", type: "Inspección", acceptance: "Snodi ingrassati p.78, precarico p.79, camme p.81 sin juego." },
            { name: "Limpieza guías placa ancoraggio / cadena / desviación carta", system: "Guías (S4M151/161/171)", frequency: "Semanal", type: "Limpieza", acceptance: "Guías limpias p.82-85, cadena lubricada p.83." },
            { name: "Limpieza objetivo fotocélula lectura muesca", system: "Fotocélula (S4M951)", frequency: "Semanal", type: "Limpieza", acceptance: "Objetivo limpio p.86 — sin falsos centrado." },
            { name: "Verificación juntas estrella + documentación PC", system: "Foil/Alimentación (S3A951)", frequency: "Mensual", type: "Inspección", acceptance: "Guarnizioni sin desgaste p.87, doc. PC al día p.88." },
            { name: "Verificación giunti sferici + pulizia cilindro", system: "Neumática (S4A081)", frequency: "Mensual", type: "Inspección", acceptance: "Giunti sin juego p.89, cilindro limpio p.90." },
            { name: "Control desgaste correa motorización", system: "Transmisión (S4A121)", frequency: "Mensual", type: "Inspección", acceptance: "Correa sin cricche p.91." },
            { name: "Verificación cuchilla fija/móvil + distancia", system: "Corte (S4A19100720)", frequency: "Semanal", type: "Ajuste", acceptance: "Filo p.98/100, smontaggio p.99/101, distanza p.102 (0,05-0,1 mm)." },
            { name: "Mantenimiento depósito aire + motore/riduttore", system: "Neumática (S4A19100720)", frequency: "Semestral", type: "Inspección", acceptance: "Depósito p.106, motore p.107 sin fugas/ruido." },
            { name: "Control fijación cojinetes soporte bobina + ejes neumáticos", system: "Portabobinas (S4A261)", frequency: "Mensual", type: "Inspección", acceptance: "Cojinetes senza gioco p.113, ejes neumáticos p.114, freno p.115." },
            { name: "Verificación cintas/nastro: desgaste, tensión, centratura, pulizia", system: "Transporte (S4A702/711/751)", frequency: "Semanal", type: "Ajuste", acceptance: "Desgaste p.119, tensión p.120, centratura p.121, correa p.122, limpieza p.123-126." },
            { name: "Instalación eléctrica — sustitución preventiva", system: "Eléctrico (S4A961)", frequency: "Anual", type: "Reemplazo", acceptance: "Revisión completa p.127-134, preventiva p.134." },
            { name: "Alimentación producto: movimientos dosificación + ejes + molle + rasatore", system: "Dosificación (S4G715)", frequency: "Semanal", type: "Limpieza/Inspección", acceptance: "Pulizia p.136/142, alberi p.137/143, molle p.138/144, rasatore p.139/145, aspiratori p.140/146." },
            { name: "Estrella alimentación: desgaste correa/juntas + rimontaggio motore", system: "Dosificación (S4G722)", frequency: "Mensual", type: "Inspección", acceptance: "Correa p.147, guarnizioni p.148, rimontaggio p.149." },
            { name: "Lubricantes recomendados (tabla p.37) + refrigerante", system: "General", frequency: "Según tabla", type: "Lubricación", acceptance: "Tabla p.37 — aplicar solo lubricantes aprobados. Ver ficha 4-Calibrado." }
          ],
          failureModes: [
            {
              name: "El carro de pinzas no baja o se queda atascado", probableSystem: "Toma de sobres (S4A12100110 / S4A08100610)", status: "Manual de Calibrado p.89-91 + Cambio de formato p.28",
              symptoms: ["El carro no llega al punto de depósito o baja a tirones", "Sobres mal depositados o caídos en la cinta", "Ruido seco al invertir el movimiento"],
              checks: ["Juego en las juntas esféricas del mando de pinzas (p.89)", "Suciedad o producto seco en el cilindro (p.90)", "Rayado o marcas en las guías verticales del carro", "Desgaste de la correa de motorización (p.91)", "Fase de toma de sobres desajustada (Cambio de formato p.28)"],
              correction: "Empezar por las juntas esféricas y el cilindro; sólo después tocar la fase. Cambiar la fase con juego mecánico no arregla nada y desajusta el depósito.",
              steps: [
                { title: "Parar y descargar el aire", where: "Pulsador de STOP y válvula de descarga Y10.8 (hilo 1016).", how: "El carro se mueve con aire: sin descargar, al soltar una junta el brazo cae." },
                { title: "Comprobar las juntas esféricas del mando de pinzas", where: "Grupo S4A08100610 — manual de Calibrado p.89 (y p.124 para las del grupo S4A71100310).", how: "Mover la articulación a mano y buscar juego. Con juego, el carro se atasca al invertir. Repuesto: juntas esféricas del grupo S4A081." },
                { title: "Limpiar el cilindro", where: "S4A08100610 — Calibrado p.90.", how: "Producto seco en el vástago frena la bajada. Limpiar y comprobar que corre libre en todo el recorrido." },
                { title: "Mirar las guías del carro", where: "Guías verticales por las que sube y baja el carro de pinzas.", how: "Rayas y marcas de arrastre indican falta de lubricación o desalineación. Si están marcadas, corregir la causa antes de volver a montar." },
                { title: "Correa de motorización", where: "S4A12100110 — Calibrado p.91.", how: "Grietas, dientes desgastados o flojedad. Repuesto: correa dentada 124 L075 (C261124075)." },
                { title: "Sólo al final, refasar", where: "Cambio de formato p.28 — regulación de fase de toma de sobres.", how: "Con el cuchillo horizontal en corte: carro al punto muerto alto y a 1 mm en fase de retorno; pinzas a 1 mm del sobre; tornillos (5) para el cierre y registro (6) para la fase de depósito. Refasar y verificar desde el display." }
              ]
            },
            {
              name: "Las planchas soldantes no cierran o el sellado sale frío", probableSystem: "Soldadura (S4M14100110 / S4A21100230)", status: "Manual de Calibrado p.71-81 + esquema hojas 40-44",
              symptoms: ["Sobres mal sellados o abiertos", "El HMI no confirma cierre de planchas", "Una plancha cierra y la otra no"],
              checks: ["Sensores de cierre B40.1 (izq.) y B40.2 (der.), y B40.8 de bloqueo", "Electroválvulas Y40.6 / Y40.7 de cierre", "Presión de soldadura B42.1 y descarga B18.2", "Precarga de los tirantes con muelle (p.79)", "Membrana y filtro de descarga de aire (p.73-74)", "Sondas PT100 B41.4 / B41.8 y contactor KM44.4"],
              correction: "Separar el problema en tres: aire (válvulas y presión), mecánica (tirantes, levas, membrana) y calor (PT100, resistencias, KM44.4). El síntoma de sellado frío casi nunca es la plancha.",
              steps: [
                { title: "¿Es aire o es calor?", where: "HMI y esquema hojas 40 (cierre), 41 y 44 (recalentamiento), 42 (soldadura).", how: "Si las planchas cierran pero el sobre sale abierto, es temperatura. Si ni siquiera cierran, es aire o mecánica." },
                { title: "Aire", where: "Y40.6 / Y40.7 (cierre izq./der.), B42.1 presostato, Y10.8 descarga.", how: "Comprobar que llega mando a las electroválvulas y que la presión de soldadura es la de trabajo." },
                { title: "Mecánica: precarga de tirantes", where: "S4M14100110 — Calibrado p.79 (control de precarga) y p.78 (engrase de articulaciones).", how: "Es la causa más común de que una plancha no acompañe a la otra. Verificar que el agujero de trabajo del bloque queda como indica la figura." },
                { title: "Membrana y filtro", where: "Calibrado p.73 (filtro de descarga de aire) y p.74 (sustitución de membrana).", how: "Membrana rota = sin fuerza de cierre. Repuestos: membrana larga L=149 (007050268), filtro C93-GACO DEM32A+P y junta AA103 D17-30." },
                { title: "Calor", where: "Sondas PT100 B41.4 / B41.8 (D7911B600650), relés K19.x, relés estáticos A41.2 / A41.6 y contactor KM44.4.", how: "Si el PLC no lee temperatura no habilita KM44.4 y no calienta. Ver el modo de falla del telerruptor para el detalle de KM44.4." },
                { title: "Limpieza de las placas", where: "Cambio de formato p.24 — sustitución de las placas de sellado.", how: "Con cepillo de bronce de cerdas finas, retirar residuos de las puntas y de las zonas de contacto; sale mejor en caliente, pero con la máquina parada y guantes." }
              ]
            },
            {
              name: "Anomalía telerruptor (contactor KM44.4)", probableSystem: "Eléctrico / Resistencias", status: "Base manual consolidada",
              symptoms: ["Alarma 'Anomalía telerruptor' en el HMI", "No calienta / no habilita resistencias"],
              checks: ["LED OUT11 vs IN2 en el PLC", "24V en bobina A1-A2", "Continuidad de bobina y diodo", "Aux 13-14 y hilo 4408", "Contactor pegado", "Protecciones F19.1 / Q01.3"],
              correction: "Comparar mando (A12.9 OUT11) y feedback (A12.4 IN2); revisar bobina, contacto auxiliar 13-14 / hilo 4408 y protecciones de KM44.4.",
              steps: [
                { title: "Seguridad y preparación (LOTO)", where: "Interruptor general Q01.3 (Siemens 3LD2504, 63A) en la hoja 1; KM44.4 en la hoja 44 (ubicación física en hoja B00).", how: "Para trabajos en POTENCIA, bloquea y etiqueta Q01.3. El mando es 24V DC (medible con cuidado), pero la potencia de KM44.4 es 220V trifásica.", spec: "Máquina consignada para tocar potencia", tool: "Candado/tarjeta LOTO", ifFail: "Si no puedes garantizar trabajo seguro, no continúes; coordina con el responsable." },
                { title: "Leer los LED del PLC (el que más rápido ubica)", where: "Módulo de salidas A12.9 (LED OUT 11) y de entradas A12.4 (LED IN 2).", how: "Con la máquina pidiendo calentar, observa: OUT 11 = comando de la bobina; IN 2 = retorno del contactor.", spec: "Con OUT11 ON, IN2 debe ponerse ON poco después", tool: "Vista (LEDs del PLC)", ifFail: "OUT11 ON pero IN2 OFF → no cierra o no vuelve el feedback (pasos 3-5). OUT11 OFF pero IN2 ON → contactor pegado (paso 6)." },
                { title: "¿Llegan 24 V a la bobina?", where: "Bornes A1 (hilo 4407) y A2 (GND) de la bobina de KM44.4, hoja 44.", how: "Multímetro en DC entre A1 y A2 en el instante en que OUT 11 está ON.", spec: "24 V DC en A1-A2 al dar el comando", tool: "Multímetro (DC)", ifFail: "Sin 24V → revisar salida A12.9 OUT11, hilo 4407, fusible/borne del 24V (X06, F04.x) y la propia tarjeta EL2809." },
                { title: "Continuidad de bobina y diodo (sin tensión)", where: "Bobina A1-A2 y diodo 3RT2926-1ER00 en paralelo.", how: "Con LOTO, mide resistencia A1-A2 y prueba el diodo en modo diodo.", spec: "Bobina ni abierta (∞) ni 0 Ω; diodo conduce en un solo sentido", tool: "Multímetro (Ω / diodo)", ifFail: "Bobina abierta → bobina quemada, cambiar contactor. Diodo en corto (0 Ω ambos sentidos) → cambiar diodo (impide energizar la bobina)." },
                { title: "Lazo de realimentación (lo más común)", where: "Contacto auxiliar 13-14 de KM44.4 → hilo 4408 → entrada A12.4 IN 2; 24V del aux por X06-3.", how: "Con el contactor cerrado, verifica 24V en el borne 13, salida por 14 hacia el hilo 4408 y 24V en la entrada IN 2 (LED encendido). Revisa aprietes de bornes en todo el recorrido.", spec: "Con KM44.4 cerrado: 13-14 cerrado y 24V en IN 2", tool: "Multímetro (DC)", ifFail: "Contactor cierra pero sin 24V en IN2 → aux 13-14 sucio/desgastado, hilo 4408 cortado o borne flojo. Limpiar/reapretar; si el aux no conmuta, cambiar el bloque auxiliar o el contactor." },
                { title: "¿Contactor pegado/soldado?", where: "Contactos de potencia 1-2/3-4/5-6 de KM44.4.", how: "Con LOTO, comprueba que se mueva libre. Con potencia (solo si imprescindible): que con el contactor abierto NO haya trifásica en 44L1/44L2/44L3.", spec: "Abre y cierra limpio; sin tensión en salida al estar abierto", tool: "Multímetro (AC), inspección", ifFail: "Si queda potencia con el contactor 'abierto' o el feedback confirma con el mando apagado → contactor soldado: reemplazar KM44.4 (3RT2326-1BB40)." },
                { title: "Protecciones y potencia aguas arriba", where: "General Q01.3 (63A, hoja 1) y magnetotérmicos F19.1/F19A.1 (10A, hojas 19/19A).", how: "Verifica que la trifásica llega a KM44.4 y que no haya protecciones disparadas.", spec: "Protecciones cerradas; fusibles íntegros", tool: "Inspección / multímetro", ifFail: "Si hay algo disparado, investiga la causa (sobrecarga/corto en resistencias) ANTES de rearmar." }
              ]
            },
            {
              name: "Atasco / corte irregular del film", probableSystem: "Corte (S4A19100720)", status: "Manual p.98-102",
              symptoms: ["Corte deshilachado", "Film no separa", "Paro por cuchilla"],
              checks: ["Filo cuchilla fija/móvil p.98/100", "Distancia entre cuchillas p.102", "Limpieza cuchilla p.109"],
              correction: "Verificar desgaste filo p.98/100, reapretar/rectificar y ajustar distancia p.102 (0,05–0,1 mm). Limpiar cuchilla p.109. Si persiste, fasatura cuchilla horizontal p.31-32 (S4A19100720-1.1)."
            },
            {
              name: "Soldadura fría / fuga en sobre", probableSystem: "Soldadura (S4M141)", status: "Manual p.71-79",
              symptoms: ["Sobre abierto", "Fuga producto", "Temperatura no alcanza"],
              checks: ["Membrana L=149 p.74", "Filtro aire p.73", "Engrase piastre p.71", "Corriente K19.x / KM44.4"],
              correction: "Ingrassaggio piastre p.71, verificar membrana y filtro p.73-74, controlar precarico tiranti p.79. Si eléctrico, diagnosticar KM44.4/K19.x (ver falla telerruptor)."
            },
            {
              name: "Descentrado de impresión / paso irregular", probableSystem: "Foto-centrado (S4M951/S4A121)", status: "Manual p.29 / p.86",
              symptoms: ["Impresión desplazada", "Muesca no leída", "Paso variable"],
              checks: ["Limpieza fotocélula p.86", "Regulación fase prelievo p.28", "Desgaste rulos p.69/96"],
              correction: "Limpiar objetivo fotocélula p.86, ajustar fase S4A12100110 p.28 (regulador numérico/pomello p.20), verificar rulos arrastre p.69/96."
            },
            {
              name: "Dosificación variable / polvo en ambiente", probableSystem: "Dosificación (S4G715/S4G722)", status: "Manual p.135-149",
              symptoms: ["Peso variable", "Polvo excesivo", "Atasco tramoggia"],
              checks: ["Limpieza movimientos p.136/142", "Molle/rasatore p.138-139", "Aspiratori polvo p.140/146", "Guarnizioni estrella p.148"],
              correction: "Pulizia movimenti dosaggio p.136/142, alberi p.137/143, verifica molle p.138/144 y rasatore p.139/145, pulizia aspiratori p.140/146. Verificar guarnizioni estrella p.148."
            },
            {
              name: "Arrastre / transporte irregular (cinta/cadena)", probableSystem: "Transporte (S4A702/S4M021)", status: "Manual p.58-64 / p.119-126",
              symptoms: ["Cinta patina / deriva", "Cadena ruidosa", "Paro transporte"],
              checks: ["Tensión cadena p.58/84", "Nivel aceite p.63", "Tensión/centratura nastro p.120-121", "Desgaste rulos p.126"],
              correction: "Control tensión cadena p.58/84, limpieza y cambio aceite p.61-64, procedimiento tensado/centratura nastro p.121, verificar rulos S4A711/S4A751 p.124-126."
            }
          ],
          documents: [
            { name: "Esquema eléctrico ES4220003 (97 hojas) — plano navegable", status: "Disponible", file: "manuales/ms235/MS235-esquema-electrico-ES4220003.pdf" },
            { name: "4 - Calibrado y regulaciones S4220003 (152 pág. ITA/SPA)", status: "Disponible", file: "manuales/ms235/MS235-4-Calibrado-Regulaciones-S4220003-ITA-SPA.pdf" },
            { name: "4A - Cambio de formato y optimización (34 pág. ITA/SPA)", status: "Disponible", file: "manuales/ms235/MS235-4a-Cambio-Formato-Optimizacion-S4220003-ITA-SPA.pdf" },
            { name: "5 - Piezas de recambio - catálogo despiece", status: "Disponible", file: "manuales/ms235/MS235-5-Piezas-de-Recambio-S4220003-ITA-SPA.pdf" },
            { name: "Lista recambios recomendada 2 años (lista n.36, 5 pág.)", status: "Disponible", file: "manuales/ms235/MS235-Recambios-Recomendados-2-Anos-S4220003-ITA-SPA.pdf" },
            { name: "Materiales en contacto con producto (2 pág. ITA/ENG)", status: "Disponible", file: "manuales/ms235/MS235-Materiales-en-Contacto-Producto-S4220003-ITA-ENG.pdf" },
            { name: "Códigos de causa y centros de costo (3 pág.)", status: "Disponible", file: "manuales/_codigos-causa/LISTADO-CODIGOS-CAUSA-CENTROS-COSTO.pdf" }
          ]
        },
        {
          id: "gkf2600",
          equipoCod: "17333005",
          causaCod: "DU",
          causaDesc: "ENCAPSULADO BOSCH (130599 - Encapsulado Sólidos)",
          name: "Encapsuladora BOSCH GKF 2600",
          model: "Encapsuladora BOSCH GKF 2600",
          current: "Código 17333005",
          area: "Sede 4 · Producción · Encapsulado",
          location: "Sede 4",
          status: "Operativo",
          criticality: "Alta",
          manual: "Manual 745632 v1.0 es (594 págs.)",
          maintenance: "Plan Bosch por horas de funcionamiento",
          completion: 90,
          image: "assets/gkf2600/vista-general.jpg",
          notes: "",
          searchAliases: ["17333005","gkf","gkf2600","gkf 2600","bosch","encapsuladora bosch","encapsuladora bosch gkf 2600","encapsuladora","capsulas","cápsulas","llenado","cierre","farmacapsulas","farmacápsulas","745632","pm kits","alarmas","hmi","dosificacion","dosificación","pellets","pastillas","segmentos","codigo interno","código interno","repuestos","inspeccion","inspección","724002341","724002342","724002343","724002338","724002339","724002340","7240022312","721703041","741203258","741203259","741203260","741203261","741203262","DU","130599","causa DU"],
          description: "Máquina Bosch de llenado y cierre de cápsulas duras, modular, con 12 estaciones en 2 líneas (18 cápsulas por ciclo). Dosifica polvo, pellets, pastillas o líquido. Documentación completa: manual de 594 págs., catálogo de repuestos de 196 págs. y PM Kits del fabricante. Incluye las 211 alarmas del HMI con su causa y remedio.",
          technicalData: {
            function: "Llenado y cierre de cápsulas duras de gelatina con polvo, pellets, pastillas o líquido, en 12 estaciones y 2 líneas simultáneas.",
            capacity: "18 cápsulas por ciclo (2 hileras × 9 taladros)",
            capsuleSizes: "000, 00, 0elong, 0, 1, 1elong, 2, 2elong, 3, 4, 5 · SUPRO A–E · DB Caps. Formatos disponibles aquí: 0, 1, 2 y 3",
            dosingSystem: "Disco dosificador con 5 puntos de compresión (polvo); pellets, pastillas o líquido según estación",
            manufacturer: "Robert Bosch Packaging Technology GmbH",
            brand: "Bosch",
            serialNumber: "745632",
            year: "2018",
            voltage: "Ver placa de características / esquema eléctrico del armario",
            power: "Ver placa de características",
            control: "Schneider PacDrive (Elau LMC400CAA10000) · PC Bosch Rexroth VPB40.3 · PLC de seguridad ABB PLUTO B46 · EtherCAT",
            weight: "Ver placa / esquema de transporte TZ_8104324117",
            dimensions: "Ver plano de emplazamiento AZ_8104324207"
          },
          summarySpecs: [
            { label: "Cápsulas por ciclo", value: "18 (2 líneas × 9)" },
            { label: "Estaciones", value: "12 (modular)" },
            { label: "Formatos aquí", value: "0, 1, 2 y 3" },
            { label: "Productos", value: "Polvo · pellets · pastillas · líquido" },
            { label: "Control", value: "Schneider PacDrive" },
            { label: "Ruido", value: "LpAeq < 70 dB(A)" },
            { label: "Ambiente", value: "+10 a +30 °C · HR máx. 50 %" },
            { label: "Año / serie", value: "2018 · 745632" }
          ],
          alarms: true,
          guideSections: [
            {
              id: "gkf-ficha",
              title: "Ficha técnica e identificación",
              content: `
<div class="guide-media"><div class="guide-media__img"><img src="assets/gkf2600/vista-general.jpg" alt="Vista general de la GKF 2600" loading="lazy"></div><div class="guide-media__body"><p><strong>Equipo:</strong> Máquina de llenado y cierre de cápsulas duras</p><p><strong>Modelo:</strong> GKF 2600 · <strong>Fabricante:</strong> Robert Bosch Packaging Technology GmbH (Waiblingen, Alemania)</p><p><strong>Año:</strong> 2018 · <strong>N.º de serie:</strong> 745632 · <strong>N.º de pedido:</strong> 3100000211</p><p><strong>Cliente:</strong> Farmacápsulas Colombia</p><p><strong>Criticidad:</strong> Alta</p></div></div><h4>Datos técnicos <span class="src-tag src-manual">MANUAL</span></h4><table class="crit-table"><tbody><tr><th>Dato</th><th>Valor</th></tr><tr><td><strong>Máquina</strong></td><td>Bosch GKF 2600 — máquina de llenado y cierre de cápsulas duras, 12 estaciones en 2 líneas, 18 cápsulas por ciclo (hileras 1/1…1/9 y 2/1…2/9)</td></tr><tr><td><strong>Identificación</strong></td><td>Año de construcción 2018 · N.º de serie 745632 · N.º de pedido total 3100000211</td></tr><tr><td><strong>Formatos de cápsula procesables</strong></td><td>000, 00, 0elong, 0, 1, 1elong, 2, 2elong, 3, 4, 5 · SUPRO A–E · DB Caps AA, A, B. Piezas de formato disponibles en esta máquina: tamaños 0, 1, 2 y 3</td></tr><tr><td><strong>Productos</strong></td><td>Polvo, pellets, pastillas y líquido; 11 variantes de llenado combinables entre las estaciones 4, 5, 6 y 8</td></tr><tr><td><strong>Volumen de dosificación (disco ajustable)</strong></td><td>De 0,127 ml (tamaño 4) a 0,902 ml (tamaño 00); tablas de altura de disco por volumen de 0,080 a 0,950 ml</td></tr><tr><td><strong>Norma de construcción</strong></td><td>EN 60204-1 (equipamiento eléctrico de máquinas); distancias de seguridad según DIN EN ISO 13857; declaración CE_Konformitaet_745632</td></tr><tr><td><strong>Condiciones ambientales de servicio</strong></td><td>+10 a +30 °C · HR máx. 50 % a 30 °C · hasta 2000 m de altitud</td></tr><tr><td><strong>Emisión de ruido</strong></td><td>LpAeq < 70 dB(A) a 1 m y 1,6 m de altura (DIN 45 635 partes 1 y 28, clase 2)</td></tr><tr><td><strong>Peso y cotas</strong></td><td>No indicados numéricamente en el texto: ver placa de características, esquema de transporte TZ_8104324117 (pág. 55) y plano de emplazamiento AZ_8104324207_b01/b02 (págs. 51 y 53)</td></tr><tr><td><strong>Control</strong></td><td>Servocontrol Schneider PacDrive, controller Elau LMC400CAA10000, servoamplificador LXM62DD45C21000, PC industrial Bosch Rexroth VPB40.3, PLC de seguridad ABB PLUTO B46 V2, SAI VAU01.1U, bus EtherCAT</td></tr><tr><td><strong>Versiones de software mostradas en el HMI</strong></td><td>Baseline, HMI, PLC, IO (configuración input/output) y Motion (Motion Control System), con tipo de máquina, cliente y n.º de pedido</td></tr><tr><td><strong>Equipos periféricos previstos</strong></td><td>Control en proceso (IPK, balanza), transportador de cápsulas vacías con o sin preclasificador, despolvoreador, detector de metales, tobera anular, balanza de control de cápsulas KKE (encadenamiento por caja de enchufe)</td></tr><tr><td><strong>Documentación entregada</strong></td><td>Manual 745632 v1.0 es (594 págs.), esquema eléctrico con lista de aparatos en el armario, carpeta de software con soporte de recuperación, catálogo de piezas de recambio 8100745632 (196 págs., NO incluye piezas electrónicas del armario ni de las cajas de bornes) y tarjeta USB "Technical Documentation" (abrir index.htm)</td></tr><tr><td><strong>Clasificación de piezas del catálogo</strong></td><td>A = pieza de desgaste (Verschleißteil) · B = pieza de recambio (Ersatzteil). Todas las piezas Bosch llevan un número de 10 dígitos grabado; las piezas sin identificación AB también se pueden pedir. Pedidos por el E-Portal (eportal.boschpackaging.com) indicando el n.º de serie</td></tr></tbody></table>
              `
            },
            {
              id: "gkf-como-funciona",
              title: "¿Cómo funciona? — qué hace y cómo lo hace",
              content: `
<p style="font-size:1.02rem">Las cápsulas vacías cerradas caen del depósito a las pistas de almacén; el bloque clasificador las orienta siempre con la tapa arriba y las introduce en los taladros de los segmentos. El vacío de la zapata de aspiración, ayudado por los pasadores de separación, abre la cápsula dejando el cuerpo en el segmento inferior. Sensores palpadores comprueban tapa y cuerpo taladro por taladro. En las estaciones de llenado (4, 5, 6, 8) se dosifica polvo (disco dosificador con 5 puntos de compresión), pellets (cámaras entre correderas o taladro del disco) o pastillas (disco dosificador giratorio con vibrador). La estación 7 aspira las cápsulas no separadas, mal colocadas o con doble sombrerete. En la estación 9 los pasadores de cierre encajan el cuerpo dentro de la tapa contra el contrasoporte con sensores. Las estaciones 10 y 11 expulsan las cápsulas conformes por la canaleta y la 12 limpia los segmentos con aire aspirado y toberas de soplado. Todo lo mueve un accionamiento principal servo con mecanismo de rodadura de levas, sincronizado con servos propios en las estaciones de llenado.</p><div class="alert-box" style="background:#eef4ff;border-color:#cdddff">Idea clave: la GKF 2600 trabaja en <strong>2 líneas simultáneas</strong> de 9 taladros cada una → <strong>18 cápsulas por ciclo</strong>. Los pasos de abajo ocurren <strong>al mismo tiempo</strong>, cada uno en una estación distinta del carrusel de segmentos.</div><h4>El proceso paso a paso</h4><div class="step-card"><div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Alimentación de cápsulas vacías al depósito</span></div><div class="step-card__row"><span>Qué hace</span><span>Mantiene lleno el depósito de cápsulas vacías de la GKF.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Manual o mediante transportador neumático (opción): aspira las cápsulas del depósito externo y las sopla por tubería clamp DN50/DN100 hasta el depósito de la máquina. Al alcanzar la altura máxima el transportador para (con clasificador previo, tras un tiempo de marcha de inercia); si el depósito queda vacío la máquina se detiene.</span></div><div class="step-card__row"><span>Mecánica</span><span>Depósito de cápsulas vacías, transportador con separador y corredera de tamiz, tubos y codos clamp con juntas y abrazaderas, válvula de purga (no ajustar ni retirar).</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Sensor de altura de llenado del depósito; opción de sensor en el depósito del transportador. Pulsador "Cápsulas vacías man."; interruptor "Vaciar depósito cáps." (puentea el sensor de nivel).</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Aire de transporte ≈0,2 bar, máx. 0,5 bar (válvula de seguridad 0,5 bar); manguera Ø int. mín. 9 mm. Alturas mín./máx. de llenado por receta; si se introduce mín. > máx., el control fija máx. = mín. + 2 cm. Cápsulas a +18/+20 °C y 40–50 % HR; NUNCA introducir cápsulas frías.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Estaciones 1 y 2 — Clasificación y orientación (1.ª y 2.ª línea)</span></div><div class="step-card__row"><span>Qué hace</span><span>Entrega las cápsulas orientadas siempre igual (tapa arriba) a los taladros de los segmentos.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El movimiento vertical del almacén hace entrar las cápsulas en las guías; el bloqueo de cápsulas libera una cápsula por guía en el descenso. Inmediatamente después del punto de lanzamiento el bloque clasificador se estrecha: el ancho es menor que el Ø de la tapa y mayor que el del cuerpo, por lo que al avanzar el resbalador clasificador sólo se mueve libremente el cuerpo y el estrechamiento retiene la tapa, quedando todas iguales. El resbalador de guía las coloca en los orificios de formato del segmento cerrado.</span></div><div class="step-card__row"><span>Mecánica</span><span>Depósito y almacenes de cápsulas con liberación, bloque clasificador (pieza de formato), correderas/resbaladores de clasificación sobre carro KWSE20 en riel TKSD 20/130, colisa y leva de liberación, placa intermedia, depósito de recogida ASB.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Sensor ultrasónico de vigilancia (8-104-233-099); interruptores "Bloquear almacén 1" y "Bloquear almacén 2" (en Automático quedan conectados y no se pueden desconectar).</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Estrechamiento: Ø cuerpo < ancho < Ø tapa. La corredera debe empujar la tapa 1–2 mm fuera del bloque clasificador. Liberación correcta: si salen 2 cápsulas por guía, bajar la leva; si no sale ninguna, subirla.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">ASB — Eliminación automática de anomalías (opción)</span></div><div class="step-card__row"><span>Qué hace</span><span>Despeja por soplado las pistas de almacén obstruidas sin parar la máquina.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Si la exploración no detecta tapa ni cuerpo en el MISMO taladro de segmentos sucesivos, se sopla la pista de almacén con aire a presión; las cápsulas expulsadas caen al depósito de recogida. Al agotarse el número de intentos, la máquina se detiene con anomalía (fallos 300–317, una por pista 1/1…2/9).</span></div><div class="step-card__row"><span>Mecánica</span><span>Pista/guía de almacén, tobera de soplado, depósito de recogida con chapa de rebote.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Interruptor "ASB" (n.º 3); isla de válvulas AV03 de 11 vías; requiere que esté conectada la exploración de la parte superior o de la inferior.</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Parámetro "GKF: Fallo de suma de limpieza del almacén" (n.º 3 del contador de predefiniciones); entrada 0 = función desconectada.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Estaciones 1 y 2 — Separación de la cápsula por vacío</span></div><div class="step-card__row"><span>Qué hace</span><span>Separa la tapa del cuerpo y deja el cuerpo en el segmento inferior para poder llenarlo.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El vacío de la zapata de aspiración tira del cuerpo y lo separa de la tapa; los pasadores de separación ajustables lo elevan y apoyan la separación. Las cápsulas que no se separan siguen intactas en el segmento superior y las retira después la estación 7.</span></div><div class="step-card__row"><span>Mecánica</span><span>Zapatas de aspiración (superficie de obturación plana y limpia), placas de pasadores de separación con manguitos y resortes, soporte de mordaza separadora, husillo y cabezal digital de ajuste.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Instalación de vacío con bomba ELMO-G, filtro G2½" con cartucho Micro-Top C 15-124/1, válvula reguladora e interruptor de presión de vigilancia (fallo 275 "falta vacío").</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Elevación del cuerpo 1–2 mm sobre el segmento inferior. Vacío: ajustar a −0,1 bar y subir en pasos pequeños hasta máx. −0,4 bar. Ajuste básico de pasadores (cabezal a 0, tope mecánico): cota A = 26,0 mm o cota B = 19 mm con pasadores estándar L = 46 mm.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Estaciones 3, 4 y 7 — Exploración de tapa y cuerpo / control en proceso</span></div><div class="step-card__row"><span>Qué hace</span><span>Comprueba que en cada taladro hay tapa y cuerpo y comunica al control las posiciones vacías.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Pasadores de exploración con muelle tantean cada uno de los 18 taladros; si no vuelven a la posición básica se genera el fallo 730 (tapa, estación 7) o 760 (cuerpo, estación 4) con el código [hilera/taladro]. Como alternativa, en la posición 3 puede montarse el control en proceso (IPK, balanza).</span></div><div class="step-card__row"><span>Mecánica</span><span>Pasadores de exploración, casquillos deslizantes 4/5,5X4 y de collarín 4/5,5/9,5X6, muelles 0,6/6,4X10,5 (cierre) y 0,4/5,4X35,8 (tapa), guiado sobre casquillos de bolas 40/52X60.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>18 sensores inductivos IQ08-02BPSKT0 (parte superior) y 18 IFS 5036 (cierre), cables AL-SKP3-10/P00, enchufe FGG.5B.354. Interruptores "Explor. parte superior" (12) y "Explor. parte inferior" (11).</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Contadores "Fallo de suma exploración parte superior" (n.º 4), "parte inferior" (n.º 5) y "Fallo de suma segmento" (n.º 2); 0 = desconectado. Visualización: taladro blanco = vacío, verde = con cápsula.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">Estación 5 — Dosificación de POLVO (estación dosificadora)</span></div><div class="step-card__row"><span>Qué hace</span><span>Forma tapones de polvo homogéneos y los introduce en el cuerpo de la cápsula con alta precisión de dosificación.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El árbol transportador (agitador + rueda de paletas + tornillo sinfín D55) lleva el polvo del depósito 1 al anillo de producto sobre el disco dosificador; un sensor vigila el nivel. En los 5 puntos de compresión las correderas cierran los taladros por abajo y los pistones compactan el polvo escalonadamente. En el punto de traspaso la corredera abre y los pistones del bloque de traspaso empujan el tapón dentro del cuerpo. El separador de producto impide que llegue polvo al punto de traspaso y una aspiración central mantiene limpio el recinto.</span></div><div class="step-card__row"><span>Mecánica</span><span>Depósito de producto 1, árbol transportador, disco dosificador fijo o ajustable, anillo de producto y placa cubierta, anillo de apoyo/apriete (~20 kg, entre 2 personas), 6 correderas, separador de producto, 5 campanas de pistones (18 pistones + 18 pernos + 18 muelles cada una), bloque de traspaso con 18 pistones y peine, anillo de guía con casquillos.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Sensor de nivel del anillo, sensor de altura de producto, motorreductor cónico GKR04 del árbol transportador con convertidor de frecuencia e interruptor térmico, acoplamiento de sobrecarga vigilado por detector IEK3002, servomotor propio SH140/30120 (opción desconectable), regulación neumática de pistones (válvula ED02) y regulación motorizada del disco (motorreductor + encoder AFM60A).</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> 5 puntos de compresión de profundidad ajustable individualmente. Presión de pistones 3 bar (opción neumática). Distancia disco–anillo de apriete: básico corredera +0,05 mm (1 raya = 0,01 mm); polvo pegajoso +0,1 mm; polvo aireado +0,02/0,03 mm. Distancia disco–separador de producto: 0,05 mm mín. en todos los puntos. Ajuste básico de pistones (disco 16,5 mm): punto 1 ≈8 mm, 2 ≈9–10, 3 ≈11–12, 4 ≈13–14, 5 ≈15,5–16,5 mm; en el punto 5 al ras o hundidos ≈1 mm.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">Estación 5 — Dosificación de PELLETS o LÍQUIDO (variantes)</span></div><div class="step-card__row"><span>Qué hace</span><span>Llena productos que no se pueden compactar (pellets) o líquido.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>En pellets NO se montan pistones en los 5 puntos de compresión (con producto normal): la dosis la define el volumen del taladro del disco dosificador; el disco de retención del árbol transportador regula la cantidad liberada por giro. En vez de las campanas de pistones se montan 2 campanas de cobertura. Con estación de líquido se alimenta líquido por la conexión de producto 3 (variantes de llenado 10 y 11).</span></div><div class="step-card__row"><span>Mecánica</span><span>Disco dosificador (pieza de formato que fija la dosis), correderas para pellets (piezas de formato), elemento de pellets del separador de producto, disco de retención con discos de reglaje, 2 campanas con mandos de muletilla.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Mismo sensor de nivel del anillo de producto y mismo accionamiento; interruptor "Pellets" de la estación 5.</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Distancia A del disco de retención: aumentar (añadir disco) si se libera poco producto, reducir (quitar disco) si se libera demasiado; el disco no debe tocar el depósito.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">Estaciones 4, 6 y 8 — Llenado de PELLETS (opción)</span></div><div class="step-card__row"><span>Qué hace</span><span>Dosifica volumétricamente pellets en el cuerpo de la cápsula.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Los pellets bajan del depósito por los tubos de alimentación a la tolva y al inserto de tolva. Las correderas de dosificación superior e inferior forman las cámaras delanteras y traseras cerradas por abajo por la placa de transferencia; con las correderas atrás se cargan las cámaras delanteras mientras las traseras vacían en las cápsulas, y al avanzar se invierte el ciclo (funcionamiento alternante continuo).</span></div><div class="step-card__row"><span>Mecánica</span><span>Depósito con corredera giratoria, bloque de guía, placa de llenado (según tamaño de cápsula), placa de transferencia, correderas de dosificación (según cantidad de llenado, piezas sensibles), guía e inserto de tolva con 4 anillos distanciadores, tornillo de ajuste con escala, servoaccionamiento propio.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Interruptor de la estación de llenado y del depósito de producto correspondiente; servoaccionamiento con valor de corrección de segmento y dispositivo vibrador (estación cíclica).</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Ranura inserto–corredera según Ø del pellet: >1,2 mm→0,5 mm (anillo H2,5); 0,9–1,2→0,4 (H2,4); 0,7–0,9→0,3 (H2,3); 0,5–0,7→0,2 (H2,2); 0,3–0,5→0,1 (H2,1); <0,3→0,03 (H2,03). Ranura mínima entre correderas 0,05 mm; no superar la carrera máx. grabada (H = x). Marcas del tornillo = 0,1 mm; 1 raya de escala = 1 mm.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">Estaciones 4, 6 y 8 — Llenado de PASTILLAS (opción)</span></div><div class="step-card__row"><span>Qué hace</span><span>Introduce comprimidos enteros en el cuerpo de la cápsula.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El vibrador transporta las pastillas del depósito de producto al depósito de la estación (nivel vigilado por sensor); el disco dosificador gira de forma continua y las pastillas caen a sus taladros, reforzado por aspiración en una zona. Sobre el pozo de traspaso caen al segmento. La unidad de toberas sopla el excedente y en otra zona se aspiran polvo y restos. Opción de barra de ionización y de limpieza automática por soplado de los taladros.</span></div><div class="step-card__row"><span>Mecánica</span><span>Depósito con corredera giratoria, tolvas de salida y recogida, vibrador con placa de cierre y placas distanciadoras, dispositivo transportador neumático, recipiente con pista interior, disco dosificador (pieza de formato), pozo de traspaso (pieza de formato), rascadores, unidad de toberas, tobera de limpieza.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Sensor de nivel (posición 4 h), pulsadores "Compri. man. est. 6/8" y "Limpiar estación 6/8"; presiones de vibrador, aire soplado y tobera de limpieza en Receta > Llenado 6/8 > Ajuste de presión; servoaccionamiento propio.</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Posiciones de montaje: unidad de toberas 11 h, soporte y sensor 4 h, rascador 5 h, tobera de limpieza 9 h. Parámetros: división del disco de pastillas, zona de llenado, tiempo de marcha de inercia de la alimentación, retardo de parada si comprimidos vacíos, tiempos de repetición y de limpieza (en ciclos).</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">10</span><span class="step-card__title">Estación 7 — Expulsión de cápsulas no conformes</span></div><div class="step-card__row"><span>Qué hace</span><span>Retira antes del cierre las cápsulas no separadas, mal introducidas o con sombrerete doble.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El estribo de expulsión sube la cápsula defectuosa y la aspiración (conectada a la aspiradora de polvo) la retira. Con el ajuste correcto, en una cápsula correcta la aspiración NO extrae la tapa del segmento superior.</span></div><div class="step-card__row"><span>Mecánica</span><span>Estribo de expulsión con anillos de formato según tamaño de cápsula, boca y correderas de aspiración con empuñadura en estrella, biela guiada sobre casquillos de bolas 20/28X30.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Aspiración conectada a la instalación de aspiración de polvo.</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Ajuste crítico: deben aspirarse todas las cápsulas subidas y ninguna tapa correcta. Manguera de evacuación 38x1,5 mm.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">11</span><span class="step-card__title">Estación 9 — Cierre de la cápsula con exploración del cuerpo</span></div><div class="step-card__row"><span>Qué hace</span><span>Une el cuerpo llenado con la tapa hasta la posición de cierre definitiva y detecta mitades faltantes.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El segmento superior se desplaza sobre el inferior; los 18 pasadores de cierre empujan el cuerpo dentro de la tapa mientras el contrasoporte la sujeta. Si falta una mitad, la cápsula no aprieta el sensor del contrasoporte y el control registra la posición para rechazarla.</span></div><div class="step-card__row"><span>Mecánica</span><span>Partes superior e inferior de segmento, portaempujadores con 18 empujadores de cierre, placa de cierre con árbol sobre casquillos 25/35X40, tornillo regulador con muelles belleville, contrasoporte con 2 empuñaduras en estrella y escalas de ajuste.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>18 sensores inductivos IFS 5036 en el contrasoporte; presostato diferencial LGW 10A2 de vigilancia de la aspiración.</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> La cápsula debe sobresalir 1,0–1,5 mm de la parte superior de segmento. Distancia contrasoporte–segmento 1,0–1,5 mm (mín. 1 mm). Distancia cápsula cerrada–contrasoporte mín. 0,5 mm sin que los pasadores presionen. Con piezas prensadas duras usar pasadores de cierre de mayor diámetro (sólo tamaños 1–000).</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">12</span><span class="step-card__title">Estaciones 10 y 11 — Expulsión de cápsulas conformes</span></div><div class="step-card__row"><span>Qué hace</span><span>Saca de los segmentos las cápsulas llenas y cerradas conformes y las lleva fuera de la máquina.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Los 18 pasadores expulsores empujan la cápsula fuera del taladro; la desviación y la guía de cápsulas (piezas de formato) las encauzan a la tubuladura y la canaleta de expulsión, donde se puede conectar el equipo aguas abajo. Las no conformes permanecen en el segmento y las aspira la estación 12. Con la opción de expulsión de cápsula única, cada cavidad tiene su cilindro y su confirmación por sensor.</span></div><div class="step-card__row"><span>Mecánica</span><span>18 árboles de guía sobre 36 casquillos 6/12X19, pasadores expulsores con protección mecánica de sobrecarga, carros PAE15ARS, 2 regletas de 9 cilindros, canaleta de expulsión con brida.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Interruptor "Control de expulsor" (contracontrol); isla de válvulas AV03 de 20 vías; 18 sensores IEB3004-BPKG con imanes permanentes; sensores de sobrecarga (fallos 195 estación 10 y 196 estación 11); espigas de evacuación con fallos 100–117 (posición no conforme) y 127–144 (posición conforme).</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Al iniciar y al reiniciar el lote se expulsan como no conformes las cápsulas de un número de ciclos configurable (opción "Contar los ciclos"). Todas las cápsulas de una pista desactivada salen como no conformes.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">13</span><span class="step-card__title">Estación 12 — Limpieza de segmentos</span></div><div class="step-card__row"><span>Qué hace</span><span>Limpia los segmentos portacápsulas y retira las cápsulas no conformes que quedaron dentro antes de volver a la clasificación.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El aire aspirado limpia los segmentos superiores e inferiores. Con la opción reforzada, punzones/toberas de soplado sumergentes con aire a presión periódico retiran manguitos, restos de cápsulas y de producto de los taladros.</span></div><div class="step-card__row"><span>Mecánica</span><span>Portatoberas con 18 punzones de limpieza Ø4 mm (9 de L=71 y 9 de L=78), bloques de limpieza superior e inferior, cubierta, chapa de rascador, guiado sobre casquillos 20/28X30.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Válvula 5/2 vías con 2 silenciadores G1/8 y expulsor por impulsos R495; pulsador "Limpiar segmento".</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Ciclo automático parametrizado: "tiempo de repetición" (ciclos entre limpiezas) y "tiempo de limpieza" (ciclos que dura la limpieza).</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">14</span><span class="step-card__title">Accionamiento principal y sincronización</span></div><div class="step-card__row"><span>Qué hace</span><span>Mueve todos los dispositivos de la máquina y marca el ciclo.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Un servomotor con reductor planetario arrastra por correa dentada el árbol principal y el mecanismo de rodadura de levas; los discos de leva mandan cierre, cápsulas no conformes y clasificación. El mecanismo paso a paso del portasegmentos indexa el giro de los segmentos y una leva genera su desplazamiento horizontal. El control compara en cada arranque la sincronización de todos los servos.</span></div><div class="step-card__row"><span>Mecánica</span><span>Árboles principales, poleas Z=45/60/64, discos de leva, palancas y barras articuladas regulables, portasegmentos con 12 soportes superiores e inferiores, estrella de guía, freno de retención.</span></div><div class="step-card__row"><span>Eléctrica / neumática</span><span>Servomotor SH140/30200 con reductor PLN115-12, encoder absoluto AFS60A y encoder de concentricidad de segmento (fallo 57 si la diferencia supera el máximo), servocontrol Schneider PacDrive, EtherCAT.</span></div><div class="step-card__params"><strong>Ajustes clave:</strong> Tensión de correas: accionamiento principal 154 Hz ±5 Hz; desplazamiento circular de segmentos 90 Hz ±5 Hz; estación dosificadora 90 Hz y 154 Hz ±5 Hz. Puesta a cero del accionamiento principal con el indicador a 0°.</div></div>
              `
            },
            {
              id: "gkf-flujo",
              title: "Entradas → Transformación → Salidas",
              content: `
<p>Todo lo que <strong>entra</strong>, cómo se <strong>transforma</strong> y todo lo que <strong>sale</strong>. Si una salida está mal, casi siempre el problema está en una entrada o en la transformación.</p><div class="io-flow"><div class="io-col io-col--in"><div class="io-col__head">↘ ENTRADAS<small>Lo que la máquina necesita</small></div><div class="io-col__body"><ul><li><strong>Energía eléctrica (conexión a red)</strong> — <em>Tensión según placa de características; construcción según EN 60204-1</em>: Comprobar coincidencia de la tensión de red, conectar según VDE o normativa local, verificar sentido de giro/campo giratorio con aparato de medición y realizar las comprobaciones eléctricas indicadas en el esquema eléctrico (página "Información técnica") antes de la primera puesta en servicio, por electricista autorizado. Interruptor principal 0=OFF / 1=ON, enclavable con candado (¡tras desconectar pueden quedar circuitos con tensión!).</li><li><strong>Aire comprimido</strong> — <em>Presión de entrada máx. 8 bar; unidad de mantenimiento ajustada a ≈6,5 bar (máx. admisible 7 bar); el cap. 6 indica comprobar ≈6 bar en el manómetro</em>: Cadena: válvula de bloqueo (bloqueable con candado) → válvula reguladora → manómetro → interruptor de presión → conexión. Debe estar libre de vapor de agua, gases agresivos y restos de aceite y grasa. Consumidores: ASB, toberas de limpieza de segmentos, unidad de toberas de pastillas, pistones de compresión (regulación neumática), expulsores, transportador de cápsulas.</li><li><strong>Calidad del aire comprimido (ISO 8573-1)</strong> — <em>Clase 6-4-1</em>: Clase 6 partículas: ≤5 mg/m³ y tamaño máx. 5 µm. Clase 4 agua: punto de rocío a presión ≤3 °C y al menos 15 °C por debajo de la temperatura ambiente y de los medios; prohibida el agua líquida. Clase 1 aceite: máx. 0,01 mg/m³ (líquidos, aerosoles y vapores).</li><li><strong>Vacío</strong> — <em>Ajuste de trabajo −0,1 bar, aumentable en pasos pequeños hasta −0,4 bar</em>: Bomba de vacío ELMO-G con filtro y válvula reguladora; interruptor de presión de vigilancia. Imprescindible para separar las cápsulas. Tiempo de marcha de inercia parametrizable tras parar la GKF. En modo Automático el interruptor "Vacío" queda conectado y no se puede desconectar.</li><li><strong>Extracción / aspiración de polvo</strong> — <em>Sin caudal especificado en la documentación</em>: Aspiradora Krahnen ES VA 2/820 (230 V, 60 Hz) o instalación de aspiración del explotador, con tubo flexible AIRDUC PUR 351 EL 70x4,5 y abrazaderas puestas a tierra. Puntos de aspiración: estación dosificadora (bajo el punto de traspaso), estación de cápsulas no conformes, estación de cierre, estación de limpieza y área 10 de la estación de pastillas. Su eficacia debe ser comprobada por un especialista antes de la primera puesta en servicio.</li><li><strong>Cápsulas duras vacías</strong> — <em>Almacenamiento y procesamiento a +18…+20 °C y 40–50 % HR. Formatos 000–5, SUPRO A–E, DB Caps AA/A/B; esta máquina con formato 0, 1, 2 y 3</em>: Conexión 1 del grupo de conexiones. NUNCA introducir cápsulas frías: adaptarlas antes a la temperatura del recinto. No usar palas de plástico (carga electrostática).</li><li><strong>Producto: polvo</strong> — <em>Depósito de producto 1; volumen del recinto de dosificación 0,127–0,902 ml según tamaño de cápsula</em>: Conexión 3 (estación 5). Transportado por el árbol transportador al anillo de producto; número de revoluciones por receta. Prohibido llenar o procesar productos explosivos o inflamables.</li><li><strong>Producto: pellets</strong> — <em>Ø de pellet contemplado <0,3 mm hasta >1,2 mm (determina el anillo distanciador)</em>: Depósito 1 (estación 5) o depósitos propios de las estaciones 4, 6 y 8. En la estación 5 la dosis la define el taladro del disco dosificador; en 4/6/8 el volumen de la cámara entre correderas.</li><li><strong>Producto: pastillas (comprimidos)</strong> — <em>Depósito de producto 3 → estación 6; depósito de producto 2 → estación 8</em>: Conexiones 2, 4 y 5. Alimentación por vibrador y dispositivo transportador neumático; no llenar en exceso el depósito de la estación (obstruye el pozo de descarga).</li><li><strong>Producto: líquido</strong> — <em>Variantes de llenado 10 y 11</em>: Estación de líquido en la estación 5, alimentado por la conexión de producto 3.</li><li><strong>Ventilación del recinto de producción</strong> — <em>—</em>: Las conexiones 2, 4 y 5 pueden usarse como ventilación del recinto cuando la estación correspondiente no lleva producto.</li><li><strong>Lubricantes</strong> — <em>Cassida Grease EPS 1 (Bremer & Leguil) y STABYL 300 AL 2 (Fuchs Lubritech); aceite con homologación H1 FDA/USDA para resortes de pistones</em>: Sólo lubricantes autorizados para el sector farmacéutico/alimentario, con alta resistencia al envejecimiento; mantener clase y calidad al rellenar.</li><li><strong>Agentes de limpieza</strong> — <em>P3-cosa Foam 40 al 0,5–1 % en agua; Tickopur RP 100A ½ copa/litro a ≈50 °C; detergente neutro pH 5–8 (tipo neodisher mediclean); antiestático Burnus para plásticos</em>: Nunca disolventes ni agentes agresivos; nunca alcohol en puertas de protección/vidrio acrílico; nunca agua sobre la máquina montada ni limpieza con alta presión.</li><li><strong>Encadenamiento / señales externas</strong> — <em>—</em>: Caja de enchufe para encadenamiento con otra máquina (p. ej. balanza de control de cápsulas KKE) y señales de la máquina postconectada (disposición de servicio, parada, atasco). Red Ethernet para datos de lote y teleservicio.</li><li><strong>Datos de receta y de lote (operario)</strong> — <em>Versión de receta activada; lote creado e iniciado</em>: Usuario conectado con nombre y contraseña; sólo las versiones en estado Borrador permiten cambiar valores; para producir hay que habilitar y activar la versión.</li></ul></div></div><div class="io-col io-col--proc"><div class="io-col__head">⟳ TRANSFORMACIÓN<small>Lo que pasa adentro</small></div><div class="io-col__body"><ul><li><strong>12 estaciones</strong> en carrusel de segmentos, <strong>2 líneas</strong> (18 cápsulas/ciclo).</li><li>Clasificación y orientación → <strong>separación por vacío</strong> → dosificación (polvo/pellets/pastillas/líquido) → rechazo → <strong>cierre</strong> → expulsión → limpieza de segmentos.</li><li>Accionamiento principal <strong>servo</strong> con mecanismo de rodadura de levas + servos propios en las estaciones de llenado.</li><li>Control <strong>Schneider PacDrive</strong> (Elau LMC400) + PLC de seguridad <strong>ABB PLUTO</strong>.</li></ul><p style="font-size:0.84rem;color:var(--muted);margin:8px 0 0">Ver el detalle en <strong>“¿Cómo funciona?”</strong>.</p></div></div><div class="io-col io-col--out"><div class="io-col__head">↗ SALIDAS<small>Deseadas y no deseadas</small></div><div class="io-col__body"><ul><li><strong>Cápsulas conformes llenadas y cerradas</strong>: Producto final. Salen por los pasadores expulsores, la desviación, la guía de cápsulas y la canaleta de expulsión; en la brida se conecta el equipo aguas abajo. Contadas en "Producto conforme en total" y por pista (1/1 a 2/9). Producto total = ciclos x número de taladros de segmento.</li><li><strong>Cápsulas no conformes (rechazo)</strong>: Cápsulas no separadas, mal introducidas o con sombrerete doble aspiradas en la estación 7; cápsulas sin tapa o sin cuerpo detectadas en el cierre; todas las cápsulas de pistas desactivadas; cápsulas de los ciclos de expulsión al iniciar/reiniciar lote. Las que llegan a la expulsión se quedan en el segmento y las retira la estación 12.</li><li><strong>Cápsulas con dosis insuficiente o sin relleno</strong>: Se producen con el interruptor "Vaciar estación de llenado" conectado durante el vaciado; deben separarse del producto bueno.</li><li><strong>Cápsulas expulsadas por la ASB</strong>: Cápsulas sopladas fuera de la pista de almacén, recogidas en el depósito de recogida con chapa de rebote.</li><li><strong>Polvo y restos de producto aspirados</strong>: Aspiración central bajo el punto de traspaso de la estación dosificadora, aspiración de la estación 7, del cierre, de la limpieza de segmentos y de la estación de pastillas; recogidos en el depósito de la aspiradora (vaciar cada 8 h). El explotador es responsable de que los filtros sean adecuados a su producto.</li><li><strong>Excedente de pastillas soplado</strong>: La unidad de toberas expulsa por soplado las pastillas sobrantes del disco dosificador.</li><li><strong>Restos de cápsulas, manguitos y producto de los segmentos</strong>: Retirados en la estación 12 por aire aspirado y, con la opción reforzada, por toberas/punzones de soplado sumergentes.</li><li><strong>Condensado de aire comprimido</strong>: Agua purgada cada 8 h de la carcasa de filtro de la unidad de mantenimiento (sólo con la máquina sin presión).</li><li><strong>Emisión de ruido</strong>: LpAeq < 70 dB(A) a 1 m de distancia y 1,6 m de altura, medido según DIN 45 635 partes 1 y 28 clase 2 en una máquina idéntica en fábrica.</li><li><strong>Datos, informes y registros</strong>: Datos de lote (impresión o PDF, máx. 5000 líneas por informe), archivos ZIP de lote (ID+fecha+hora), Audittrail conforme a 21 CFR parte 11, copia de seguridad en C:\\Customer\\Bosch_Backup\\30 HMI\\Data, backup de lotes en c:\\Customer\\BatchBackup, archivo de diagnóstico del servocontrol *.pdi.</li><li><strong>Señalización de estado</strong>: Semáforo: rojo = anomalía o PARADA DE EMERGENCIA accionada; naranja parpadeante = nivel mínimo no alcanzado (con avisador acústico); verde = servicio automático. Campo de mensajes del HMI: azul = mensajes, amarillo = advertencias, rojo = anomalías.</li><li><strong>Residuos de desmontaje / fin de vida</strong>: Los grupos desmontados se desarman en piezas individuales y se eliminan de forma respetuosa con el medio ambiente; antes retirar completamente aceites y sustancias que contaminen el agua.</li></ul></div></div></div><h4>La salida que nos importa en mantenimiento: “máquina disponible”</h4><p>Para producción la salida es la cápsula llena; para <strong>mantenimiento</strong> nuestra salida es que la máquina <strong>esté disponible y dosificando dentro de tolerancia</strong>. Eso se mide con indicadores (MTBF, MTTR, disponibilidad) y con el <strong>peso de cápsula</strong> del control en proceso.</p><div class="alert-box">⚠ <strong>Seguridad (todo el flujo):</strong> el polvo farmacéutico puede ser tóxico y explosivo — eliminar acumulaciones de polvo de inmediato, conectar a tierra y usar filtros aptos para el producto. Nunca acercar partes del cuerpo a las tuberías de aspiración con la máquina en marcha.</div>
              `
            },
            {
              id: "gkf-estaciones",
              title: "Las 12 estaciones de la máquina",
              content: `
<div class="guide-media" style="grid-template-columns:1fr"><div class="guide-media__img"><img src="assets/gkf2600/estaciones.jpg" alt="Configuración de las 12 estaciones de la GKF 2600" loading="lazy"></div></div><p>La GKF 2600 es <strong>modular</strong>: las estaciones 4, 6 y 8 son opcionales y se equipan según el producto (hay 11 variantes de llenado combinables). Las cápsulas giran en el carrusel de segmentos pasando por cada estación.</p><table class="crit-table"><tbody><tr><th>Estación</th><th>Función</th><th>Tipo</th></tr><tr><td><strong>1</strong></td><td>Clasificación, suministro y alineación de cápsulas + separación</td><td>1.ª línea</td></tr><tr><td><strong>2</strong></td><td>Clasificación, suministro y alineación de cápsulas + separación</td><td>2.ª línea</td></tr><tr><td><strong>3</strong></td><td>Exploración de parte superior/inferior de cápsula o control en proceso (CEP)</td><td>Opción</td></tr><tr><td><strong>4</strong></td><td>Llenado de pellets, llenado de pastillas o exploración de la parte superior</td><td>Opción</td></tr><tr><td><strong>5</strong></td><td>Estación dosificadora: dosificación de polvo o de pellets</td><td>Principal</td></tr><tr><td><strong>6</strong></td><td>Llenado de pellets o de pastillas</td><td>Opción</td></tr><tr><td><strong>7</strong></td><td>Cápsulas no conformes: expulsa las no separadas, mal colocadas o con sombrerete doble</td><td>Rechazo</td></tr><tr><td><strong>8</strong></td><td>Llenado de pellets o de pastillas</td><td>Opción</td></tr><tr><td><strong>9</strong></td><td>Cierre de cápsula con dispositivo sensor de parte inferior</td><td>Principal</td></tr><tr><td><strong>10</strong></td><td>Expulsión de cápsulas terminadas</td><td>1.ª línea</td></tr><tr><td><strong>11</strong></td><td>Expulsión de cápsulas terminadas</td><td>2.ª línea</td></tr><tr><td><strong>12</strong></td><td>Limpieza de segmentos</td><td>Principal</td></tr></tbody></table><div class="guide-media" style="grid-template-columns:1fr;margin-top:14px"><div class="guide-media__img"><img src="assets/gkf2600/conexiones.jpg" alt="Conexiones de producto y cápsulas vacías" loading="lazy"></div></div>
              `
            },
            {
              id: "gkf-hmi",
              title: "Panel de mando y control (HMI)",
              content: `
<p>Elementos del panel de mando y del control (Schneider PacDrive con PC industrial Bosch Rexroth).</p><table class="crit-table"><tbody><tr><th>Elemento</th><th>Función</th></tr><tr><td><strong>Pulsadores del pupitre</strong></td><td>PASO A PASO (mantener accionado en Marcha a pasos HMI) · PARADA DE EMERGENCIA (seta enclavable) · RESET (pone la máquina en disposición tras eliminar anomalías) · PARO (parada normal) · ARRANQUE (inicia producción y confirma puestas a cero)</td></tr><tr><td><strong>Selector de modos con llave e interruptor principal</strong></td><td>Llave 0: PARO SERVICIO ESPECIAL (paso a paso con puertas cerradas) · 1: MARCHA SERVICIO ESPECIAL (paso a paso con puertas abiertas, sólo personal autorizado). Interruptor principal 0=OFF/1=ON, enclavable con candado</td></tr><tr><td><strong>Línea de cabecera</strong></td><td>Tipo y número de máquina · usuario (conectar/desconectar y cambiar contraseña) · modo de servicio · campo de mensajes (azul=mensajes, amarillo=advertencias, rojo=anomalías) · receta actual · lote actual · velocidad · contador de producción</td></tr><tr><td><strong>Línea de menú</strong></td><td>Receta · Producción · Archivo · Configuración del sistema · Interruptores · Imprimir · Regleta de interruptores (configurable en Configuración > Ajuste de la máquina)</td></tr><tr><td><strong>Modos de servicio</strong></td><td>501 Automático · 502 Marcha a pasos HMI · 503 Marcha a pasos cable · 505 Abrir freno de retención · 508 Accionamientos cero · 515 Servicio en línea (la GKF se detiene con anomalía de la máquina postconectada)</td></tr><tr><td><strong>Interruptores GKF 1–30</strong></td><td>1 Instalación aspiración · 2 Vacío · 3 ASB · 4 Preparación · 5 y 6 Bloquear almacén 1 y 2 · 7 Control de expulsor · 11 Explor. parte inferior · 12 Explor. parte superior · 13 Disco dosificador fijo (3–14 mm) · 14 Disco dosificador fijo 2 (14,1–27 mm) · 15/16/17 Depósito producto 1/2/3 · 21/22/23 Vaciar depósito 1/2/3 · 24 Vaciar depósito cáps. · 60 Iluminación. Los interruptores 1, 2, 5, 6, 7, 11 y 12 quedan conectados y NO se pueden desconectar en Automático</td></tr><tr><td><strong>Pulsadores GKF 101–130</strong></td><td>101 Limpiar segmento · 102 Aliment. prod. manual (accionar sólo brevemente) · 103/104 Depósito prod. 1/2 manual · 106 Cápsulas vacías man. · 107/108 Pres. pistón compr. +/− · 109/110 Disco dosificador +/− (inactivos en automático con máquina parada) · 112/120 Compri. man. est. 8/6 · 119/121 Limpiar estación 8/6 · 124 Traspaso cápsulas manual (tobera anular) · 130 Prueba de lámparas</td></tr><tr><td><strong>Administración de recetas</strong></td><td>Estados Borrador, Habilitado, Bloqueado y Borrado. Sólo en Borrador se cambian valores; para producir hay que habilitar y activar y después crear e iniciar un lote. Bloqueo y borrado son irrevocables; la versión activada aparece con fondo verde. Tras conectar el interruptor principal queda activa la última versión activada</td></tr><tr><td><strong>Control de lotes</strong></td><td>Crear, iniciar (Arranque), interrumpir, continuar y finalizar el lote (con la máquina detenida). Tras iniciar no se pueden cambiar identificación ni tamaño; un lote finalizado no se puede reiniciar y se borran los cambios de la versión activada. Tamaño de lote = 0 desconecta el contador</td></tr><tr><td><strong>Interruptores de vaciado</strong></td><td>Vaciar depósito cáps., Vaciar estación de llenado y Vaciar el depósito 1/2/3: desconectan los sensores de nivel para poder agotar el producto. Con Vaciar estación de llenado conectado pueden salir cápsulas con dosis insuficiente o sin relleno</td></tr><tr><td><strong>Estados de los botones</strong></td><td>Indicación blanca = desconectado / no accionado · verde = conectado / accionado · parpadeando = el control aún no ha podido ejecutar la función · designación tachada = no se puede accionar en ese modo o el usuario no tiene autorización (consultar motivos con el símbolo de Ayuda)</td></tr><tr><td><strong>Diagnóstico</strong></td><td>Historial de alarmas y frecuencia de alarma con período ajustable · contador de horas de servicio (punto rojo/verde) · registro de desplazamiento GKF (asignación de segmentos y estado de las cápsulas) · diagnóstico de aparatos (servos, servocontrol, EtherCAT) · diagnóstico IPC con calibración del táctil · Diagnóstico SAI · Diagnóstico Schneider (archivo *.pdi)</td></tr><tr><td><strong>Audittrail (opción)</strong></td><td>Registro inalterable con fecha, hora, acción y usuario; visor AudittrailViewer con filtros por usuario, función, suceso y período (fijar filtros ANTES de visualizar en archivos grandes; el interruptor Filtrar debe estar conectado), exportación a archivo y campo para escribir comentarios</td></tr><tr><td><strong>Configuración de la máquina</strong></td><td>Unidad de rendimiento T/min, cap/min o cap/hora (en paso a paso siempre T/min) · °C o °F · A4 o Letter · varias versiones validadas por receta · estructura y separador del ID de lote · sello de tiempo del PDF (_AñoMesDía_HoraMinutoSegundo) · contenido de los informes · ciclos de expulsión al iniciar y reiniciar lote con opción "Contar los ciclos" · asignación de la regleta de interruptores</td></tr><tr><td><strong>Semáforo y avisador acústico</strong></td><td>Rojo = anomalía o PARADA DE EMERGENCIA accionada · naranja parpadeante = nivel mínimo no alcanzado en depósito de cápsulas o de producto (con zumbador) · verde = servicio automático. El zumbador se apaga al reponer el nivel o parando la máquina y pulsando RESET</td></tr><tr><td><strong>Teleservicio</strong></td><td>Interruptor con llave 0: TELESERVICIO PARO / 1: TELESERVICIO MARCHA e interruptor HMI "Manten. remoto"; la lámpara parpadea al establecer la conexión y se ilumina fija cuando está establecida</td></tr><tr><td><strong>Niveles de usuario (contraseñas de fábrica, deben cambiarse)</strong></td><td>operator: 0001 · setup: 2003 · supervisor: 0007 · admin: 2468 · adminbosch. Nombre y contraseña de al menos 4 caracteres; el punto pasa de rojo a verde al cumplirse las reglas</td></tr></tbody></table><div class="alert-box" style="background:#eef4ff;border-color:#cdddff">Cuando el HMI muestre un <strong>número de fallo</strong>, búscalo en la pestaña <strong>“Alarmas HMI”</strong>: están los 211 mensajes del manual con su causa y su remedio.</div>
              `
            },
            {
              id: "gkf-plan-mtto",
              title: "Plan de mantenimiento Bosch (por horas de funcionamiento)",
              content: `
<p><span class="src-tag src-manual">PLAN DEL FABRICANTE</span> A diferencia de otras máquinas, aquí <strong>Bosch sí define el plan completo</strong>, organizado por <strong>horas de funcionamiento</strong>. No hay que inventar frecuencias: hay que <strong>llevar el contador de horas</strong> de la máquina.</p><h4>Los 9 niveles del plan Bosch (manual cap. 8)</h4><div class="tier-head"><span class="tier-chip" style="background:#0e9f6e">8 h</span> <small>Cada turno — Limpieza general con aire de aspiración, purga de la unidad de mantenimiento, filtro de vacío, zapatas de aspiración y resortes.</small></div><div class="tier-head"><span class="tier-chip" style="background:#0e9f6e">40 h</span> <small>Semanal — Sensores, pantalla del panel de mando y limpiezas más a fondo.</small></div><div class="tier-head"><span class="tier-chip" style="background:#2563eb">160 h</span> <small>Mensual — Inspecciones y lubricación de conjuntos.</small></div><div class="tier-head"><span class="tier-chip" style="background:#2563eb">500 h</span> <small>≈ Trimestral — Revisión de desgaste y ajustes.</small></div><div class="tier-head"><span class="tier-chip" style="background:#b45309">1.000 h</span> <small>≈ Semestral — Comprobaciones mayores.</small></div><div class="tier-head"><span class="tier-chip" style="background:#b45309">2.000 h</span> <small>≈ Anual — Sustitución de piezas de desgaste.</small></div><div class="tier-head"><span class="tier-chip" style="background:#dc2626">5.000 h</span> <small>Plurianual — Revisión profunda.</small></div><div class="tier-head"><span class="tier-chip" style="background:#dc2626">10.000 h</span> <small>Plurianual — Overhaul de conjuntos.</small></div><div class="tier-head"><span class="tier-chip" style="background:#dc2626">30.000 h</span> <small>Gran revisión — Reacondicionamiento general.</small></div><div class="alert-box" style="background:#eef4ff;border-color:#cdddff">La equivalencia en calendario (semanal, mensual…) es <strong>orientativa</strong>: depende de cuántas horas al día trabaje la máquina. Lo que manda es el <strong>contador de horas</strong>.</div><h4>Tareas de mantenimiento</h4><table class="crit-table"><tbody><tr><th>Frecuencia</th><th>Tarea</th><th>Sistema</th><th>Criterio / observación</th></tr><tr><td>Diario</td><td><strong>Limpiar toda la máquina, el recinto de producción y todas las partes en contacto con el producto; retirar restos de producto y cápsulas</strong></td><td>Máquina completa</td><td>Sólo aire de ASPIRACIÓN, nunca aire de soplado (introduce partículas en cojinetes y componentes eléctricos). Sin capas de polvo acumulado (riesgo de explosión)</td></tr><tr><td>Diario</td><td><strong>Limpiar las puertas de protección</strong></td><td>Cabina / seguridad</td><td>Sólo detergentes y conservantes antiestáticos para plásticos (Burnus). ¡Nunca alcohol ni agentes agresivos: dañan el vidrio acrílico!</td></tr><tr><td>Diario</td><td><strong>Purgar el agua de la carcasa de filtro de la unidad de mantenimiento</strong></td><td>Aire comprimido</td><td>Abrir la válvula sólo con la máquina sin presión y purgada</td></tr><tr><td>Diario</td><td><strong>Limpiar o cambiar el elemento filtrante de la instalación de vacío</strong></td><td>Vacío</td><td>Soplar de dentro hacia fuera. El intervalo lo define el explotador según el producto; con producto fino y no comprimible, más a menudo o cambiar</td></tr><tr><td>Diario</td><td><strong>Comprobar y limpiar las zapatas de aspiración (taladros y superficie de obturación) y sus resortes</strong></td><td>Estación de separación</td><td>Superficie de obturación plana y sin daños; sustituir zapatas deformadas y resortes dañados</td></tr><tr><td>Diario</td><td><strong>Comprobar la suciedad del filtro de la aspiradora (manómetro) y vaciar el depósito de suciedades</strong></td><td>Aspiración de polvo</td><td>—</td></tr><tr><td>Semanal</td><td><strong>Limpiar los sensores con paño suave sin hilachas</strong></td><td>Sensórica</td><td>—</td></tr><tr><td>Semanal</td><td><strong>Limpiar la pantalla del panel de mando con la función "Limpiar la pantalla"</strong></td><td>HMI</td><td>Paño antiestático blando o limpiacristales con alcohol; nunca disolventes, abrasivos, objetos afilados ni alta presión. El táctil se desactiva ≈30 s</td></tr><tr><td>Semanal</td><td><strong>Limpiar la carcasa de filtro y el cartucho filtrante de la unidad de mantenimiento</strong></td><td>Aire comprimido</td><td>Sólo agua (y agente suave); jamás disolventes. Montar la carcasa girada 45° hasta que el desbloqueo engatille de forma audible</td></tr><tr><td>Semanal</td><td><strong>Limpiar y engrasar con capa fina los árboles de guía de: concentricidad de segmento, estación de clasificación, estación de separación, exploración de la parte superior, estación dosificadora, estación de cápsulas defectuosas, estación de cierre y estación de limpieza</strong></td><td>Todas las estaciones</td><td>Eliminar la grasa usada; aplicar Cassida Grease EPS 1</td></tr><tr><td>Mensual</td><td><strong>Comprobar el asiento firme de todas las piezas de fijación y apriete</strong></td><td>Máquina completa</td><td>Cambiar los tornillos autofijadores que se hayan aflojado</td></tr><tr><td>Mensual</td><td><strong>Comprobar juntas y cojinetes respecto a daños</strong></td><td>Máquina completa</td><td>Cambiar inmediatamente los que muestren daño</td></tr><tr><td>Mensual</td><td><strong>Comprobar las juntas de las abrazaderas de tubo (Tri-Clamp)</strong></td><td>Tuberías</td><td>Cambiar ante cualquier daño; cuidar la posición concéntrica de junta y tubuladuras</td></tr><tr><td>Mensual</td><td><strong>Limpiar el interruptor de presión del vacío (soplar orificios y tubería de depresión)</strong></td><td>Vacío</td><td>Con producto fino y no comprimible, más a menudo</td></tr><tr><td>Mensual</td><td><strong>Limpiar y engrasar las superficies de rodadura de todas las poleas</strong></td><td>Transmisiones</td><td>Capa fina de STABYL 300 AL 2</td></tr><tr><td>Mensual</td><td><strong>Comprobar daños y tensión de las correas dentadas (accionamiento principal, desplazamiento de segmentos y estación dosificadora)</strong></td><td>Transmisiones</td><td>154 Hz ±5 Hz (principal y dosificadora con tornillo tensor); 90 Hz ±5 Hz (segmentos y dosificadora con rueda tensora). ¡No tensar demasiado! Sustituir de inmediato las correas dañadas</td></tr><tr><td>Mensual</td><td><strong>Engrasar la guía de la corredera de clasificación por su boquilla y engrasar la superficie de rodadura del cojinete</strong></td><td>Estación de clasificación</td><td>1–2 emboladas de Cassida Grease EPS 1 en la boquilla; capa fina de STABYL 300 AL 2 en la superficie de rodadura; retirar la grasa sobrante y no apretar la junta de la caperuza</td></tr><tr><td>Mensual</td><td><strong>Limpiar y lubricar la pista de levas y el rodillo de leva de la estación de llenado de pellets</strong></td><td>Estación de llenado de pellets</td><td>STABYL 300 AL 2; desmontar la parte superior del accionamiento (5 tornillos)</td></tr><tr><td>Mensual</td><td><strong>Lubricar la leva de corredera y los árboles de guía de la estación de llenado (bajo el anillo de protección, 3 tornillos)</strong></td><td>Estación dosificadora</td><td>Árboles de guía con Cassida Grease EPS 1; taladros llenos de STABYL 300 AL 2</td></tr><tr><td>Mensual</td><td><strong>Comprobar con la probeta los casquillos de guía del anillo de guiado de pistón de compresión</strong></td><td>Estación dosificadora</td><td>Si la probeta NO entra, el casquillo está bien; si SÍ entra, está usado y hay que reemplazarlo. Casquillos y juego de herramientas se compran a Bosch con instrucciones de montaje</td></tr><tr><td>Mensual</td><td><strong>Limpiar y lubricar las superficies de rodadura de la protección contra torsión de la estación de cápsulas defectuosas y de la estación de cierre</strong></td><td>Estaciones 7 y 9</td><td>Capa fina de STABYL 300 AL 2</td></tr><tr><td>Mensual</td><td><strong>Comprobar tubos flexibles, filtro principal e incrustaciones de la aspiradora; control visual de cables</strong></td><td>Aspiración de polvo</td><td>Reemplazar el filtro deteriorado</td></tr><tr><td>Trimestral</td><td><strong>Comprobar todos los dispositivos eléctricos respecto a daños</strong></td><td>Instalación eléctrica</td><td>Desconectar y asegurar el interruptor principal contra la reconexión. Un aparato eléctrico dañado puede generar la chispa de ignición de una explosión de polvo</td></tr><tr><td>Trimestral</td><td><strong>Comprobar los interruptores de seguridad de puertas, caperuzas y cubiertas (daños y funcionamiento)</strong></td><td>Seguridad</td><td>En Automático, con la puerta abierta y pulsando ARRANQUE debe aparecer mensaje de anomalía y la máquina no debe arrancar. Cambiar de inmediato los interruptores dañados</td></tr><tr><td>Trimestral</td><td><strong>Limpiar y lubricar el husillo de ajuste de los pasadores de separación</strong></td><td>Estación de separación</td><td>Capa fina de Cassida Grease EPS 1</td></tr><tr><td>Semestral</td><td><strong>Verificar conectadores enchufables y uniones de apriete del panel de mando</strong></td><td>HMI / armario eléctrico</td><td>Bien puestos y sin defectos (Bosch Rexroth VDP40.3, R-911-173-921)</td></tr><tr><td>Por horas: 2000 h</td><td><strong>Comprobar la función del freno de los servomotores AC en servicio</strong></td><td>Accionamientos</td><td>Servomotores 8-108-175-006 (estación dosificadora) y 8-109-521-634 (principal)</td></tr><tr><td>Por horas: 2000 h</td><td><strong>Verificar la estera filtrante, las láminas y los ruidos del ventilador con filtro del armario eléctrico</strong></td><td>Armario eléctrico</td><td>Reemplazar la estera sucia. Reducir el intervalo según el grado de ensuciamiento del aire ambiente</td></tr><tr><td>Por horas: 2000 h</td><td><strong>Verificar líneas, conectadores y ventiladores del PC industrial</strong></td><td>Control</td><td>Sin roturas ni aplastamientos; reemplazar de inmediato las piezas defectuosas</td></tr><tr><td>Por horas: 2000 h</td><td><strong>Revisión general de la aspiradora por el constructor o servicio posventa</strong></td><td>Aspiración de polvo</td><td>Inspección del estado general del aparato</td></tr><tr><td>Por horas: 5000 h</td><td><strong>Cambiar juntas y cojinetes</strong></td><td>Máquina completa</td><td>Sustitución preventiva</td></tr><tr><td>Por horas: 5000 h</td><td><strong>Comprobar y apretar las conexiones eléctricas de atornillamiento y apriete del armario eléctrico y las cajas de bornes</strong></td><td>Armario eléctrico</td><td>Sólo especialista electrónico, con el interruptor principal desconectado y asegurado. Cambiar de inmediato los componentes dañados</td></tr><tr><td>Por horas: 5000 h</td><td><strong>Comprobar obturaciones, caja y tapa de cojinete, engranajes y nivel de aceite del mecanismo paso a paso de dosificación</strong></td><td>Estación dosificadora</td><td>Sin sobrecalentamiento, cambio de color, ruidos anormales ni juego (HTSG 133-6-H150, 8-104-242-001)</td></tr><tr><td>Por horas: 10000 h</td><td><strong>Cambiar la pila CMOS del PC industrial</strong></td><td>Control</td><td>—</td></tr><tr><td>Por horas: 10000 h</td><td><strong>Cambiar el lubricante del motor de engranaje cónico de la alimentación de polvo y verificar los anillos-retén</strong></td><td>Alimentación de producto</td><td>Reemplazar los anillos-retén con fugas (Lenze GKR04-2M, 8-108-170-987)</td></tr><tr><td>Por horas: 10000 h</td><td><strong>Cambiar la batería del controller Elau LMC400</strong></td><td>Control</td><td>—</td></tr><tr><td>Por horas: 10000 h</td><td><strong>Reemplazar el acumulador del módulo SAI</strong></td><td>Armario eléctrico</td><td>A 25 °C dura 10 años; la vida útil se reduce a la mitad por cada 10 °C de aumento de temperatura</td></tr><tr><td>Por horas: 30000 h</td><td><strong>Reemplazar todos los elementos de obturación, rodamientos y rodillos de leva del mecanismo paso a paso de dosificación</strong></td><td>Estación dosificadora</td><td>—</td></tr><tr><td>Anual</td><td><strong>Comprobación del estado seguro de dispositivos de protección, instalaciones de advertencia, bloqueos y acoplamientos por un especialista</strong></td><td>Seguridad</td><td>Como mínimo una vez al año; documentar los resultados en un certificado de comprobación</td></tr><tr><td>Según necesidad</td><td><strong>Comprobar la eficacia de los dispositivos de aspiración de sustancias dañinas para la salud</strong></td><td>Aspiración</td><td>Antes de la primera puesta en servicio y tras modificaciones; realizada por un especialista</td></tr><tr><td>Según necesidad</td><td><strong>Comprobar la secuencia de movimiento sin colisiones en marcha paso a paso y el paso de cápsulas</strong></td><td>Mecánica general</td><td>En cada preparación, antes de producir; en caso de colisión parar inmediatamente</td></tr><tr><td>Según necesidad</td><td><strong>Comprobar el proceso de llenado y el peso de las cápsulas</strong></td><td>Estaciones de llenado</td><td>En cada preparación de una estación de llenado, con varios ciclos en marcha paso a paso</td></tr><tr><td>Según necesidad</td><td><strong>Almacenar los datos de lote en un medio externo y borrarlos del soporte interno</strong></td><td>Seguridad de datos</td><td>Tras finalizar cada lote; directorio c:\\Customer\\BatchBackup\\... La vida útil de los soportes internos es limitada</td></tr><tr><td>Según necesidad</td><td><strong>Puesta a cero de los servoaccionamientos</strong></td><td>Accionamientos</td><td>Sólo tras cambio de correas dentadas o reparaciones de mayor envergadura y sólo por personal técnico formado; una puesta a cero incorrecta provoca colisiones y dosificaciones erróneas</td></tr><tr><td>Según necesidad</td><td><strong>Prueba de lámparas del semáforo (pulsador 130)</strong></td><td>Señalización</td><td>Cambiar las lámparas que no se iluminan</td></tr><tr><td>Según necesidad</td><td><strong>Ajuste básico de la balanza tras reinstalar el programa de mando</strong></td><td>Balanza (si equipada)</td><td>Después de cada recuperación de software</td></tr><tr><td>Según necesidad</td><td><strong>Limpieza básica: desmontaje, limpieza convencional / ultrasonidos / lavadora y montaje</strong></td><td>Piezas en contacto con producto</td><td>Convencional: rociar y dejar actuar 2 min, aclarar ≥1 min con agua tibia y ≥1 min con agua limpia, secar (≥30 min en armario). Ultrasonidos: ≈50 °C, mín. 5 min — ¡las piezas revestidas NO van a ultrasonidos (número en negrita/cursiva en el catálogo)! Lavadora: lavado máx. 60 °C, secado máx. 75 °C, detergente pH 5–8</td></tr></tbody></table><h4>Cómo ajustar el plan</h4><ul><li>Bosch avisa que <strong>el intervalo del filtro de vacío depende del producto</strong>: con polvo fino y no comprimible, limpiar o cambiar más a menudo. <strong>El propietario debe definir esa frecuencia.</strong></li><li>Si una falla se repite en un sistema → acorta el intervalo de ese punto y busca la causa raíz.</li><li>Registra las horas de cada intervención para que los <strong>PM Kits</strong> se pidan a tiempo.</li></ul>
              `
            },
            {
              id: "gkf-pmkits",
              title: "PM Kits de Bosch (kits de mantenimiento preventivo)",
              content: `
<p>Bosch vende <strong>kits de mantenimiento preventivo (PM Kits)</strong>: paquetes con todas las piezas de desgaste de un conjunto, ya preparados. Evitan parar la máquina esperando repuestos.</p><table class="crit-table"><tbody><tr><th>Kit</th><th>Intervalo recomendado</th><th>Referencia Bosch</th><th>Contenido / notas</th></tr><tr><td><strong>PM Kit 1 — Rotación de segmentos (Segment Rotation)</strong></td><td>4000 h / 2 años · 7 h de intervención</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013165</td><td>Piezas de desgaste del grupo de rotación de segmentos; incluye además el rascador de vástago 8-104-234-336 (D=20 mm).</td></tr><tr><td><strong>PM Kit 2 — Estación de orientación y separación</strong></td><td>4000 h / 2 años · 4 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013166</td><td>Además de las piezas del despiece: rascador AS16X22X3,0X4,0 PUR 8-108-024-197; cartucho filtrante Micro-Top C 15-124/1 8-108-643-460; cartucho de malla fina 0,1 µm C 15-154/1 8-108-145-572; módulo de filtro de aire EIT-130-8474 HEPA 14 8-108-179-327; cordón perfilado 4,2x4,2 VMQ 55 Shore A FD 8-108-000-479.</td></tr><tr><td><strong>PM Kit 3 — Pin de detección de cápsula</strong></td><td>6000 h / 3 años · 2 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013173</td><td>Piezas de desgaste del palpador de detección de cápsula.</td></tr><tr><td><strong>PM Kit 4 — Estación de dosificación de polvo</strong></td><td>4000 h / 2 años · 3 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013168</td><td>Además de las piezas del despiece: chaveta AS 6X6X20 8-109-514-567; anillo de retención A 25X1,2 (1.4310) 8-103-709-949; rodillo de leva KR 5201 NPPU 8-108-136-239.</td></tr><tr><td><strong>PM Kit 5 — Suspensión neumática</strong></td><td>6000 h / 3 años · 3 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013175</td><td>Piezas de desgaste de la suspensión neumática de compresión; incluye tornillo avellanado M4x8 A2-70 8-108-193-318.</td></tr><tr><td><strong>PM Kit 6 — Rechazo de cápsulas</strong></td><td>4000 h / 2 años · 1 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013169</td><td>Piezas de desgaste del sistema de rechazo/expulsión de cápsulas no conformes.</td></tr><tr><td><strong>PM Kit 7 — Accionamiento de compuertas deslizantes (correderas)</strong></td><td>4000 h / 2 años · 3 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013167</td><td>Piezas de desgaste del accionamiento de las correderas de dosificación.</td></tr><tr><td><strong>PM Kit 8 — Estación de cierre con detección de cápsula</strong></td><td>6000 h / 3 años · 3 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013170</td><td>Piezas de desgaste de la estación de cierre; referencias señaladas: 8-103-239-258, 8-101-201-750, 8-104-307-468.</td></tr><tr><td><strong>PM Kit 9 — Estación de expulsión de cápsulas</strong></td><td>4000 h / 2 años · 5 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013171</td><td>El kit más extenso: 8-108-100-311, 8-104-238-093, 8-104-236-327 (18x), 8-104-307-158, 8-104-307-122, 8-104-291-152, 8-104-307-196, 8-108-127-817, 8-101-203-722, 8-108-166-044, 8-104-236-204, 8-108-137-245 (18x), 8-104-238-543 (6x), 8-108-146-562 (18x), 8-108-100-367 (12x).</td></tr><tr><td><strong>PM Kit 10 — Estación de limpieza de segmentos</strong></td><td>6000 h / 3 años · 1 h</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104013172</td><td>Piezas de desgaste de la estación de limpieza; referencias señaladas: 8-104-234-336 y 8-108-127-927.</td></tr><tr><td><strong>Accesorio — Sistema de transporte de piezas de formato</strong></td><td>Accesorio (sin intervalo)</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318108176646</td><td>Carro para almacenamiento ordenado, apoyo en el montaje y transporte cuidadoso de las piezas de formato; reduce daños y costos de herramienta.</td></tr><tr><td><strong>Accesorio — Anillo guía de pines de compactación con bujes de plástico</strong></td><td>Accesorio (sin intervalo)</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104236308</td><td>Anillo guía con bujes plásticos: cambio rápido de bujes defectuosos, menor costo de reemplazo, mayor vida útil de los pistones de compresión y capacidad para productos difíciles.</td></tr><tr><td><strong>Accesorio — Herramienta de reparación del anillo guía de pines de compactación</strong></td><td>Accesorio (sin intervalo)</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">90318104231390</td><td>Herramental para sustituir los bujes guía del anillo de guiado de pistones de compresión.</td></tr></tbody></table><div class="alert-box">Para pedirlos: E-Portal de Bosch (<em>eportal.boschpackaging.com</em>) indicando el <strong>n.º de serie 745632</strong> y el kit. Bosch aclara que la frecuencia recomendada es <strong>orientativa</strong> y varía según el producto y las condiciones.</div>
              `
            },
            {
              id: "gkf-inspeccion-ago2026",
              title: "Inspección de agosto de 2026 — repuestos a cambiar y código interno",
              content: `
<p><span class="src-tag src-manual">HALLAZGO DE PLANTA</span> Revisión de la máquina de <strong>agosto de 2026</strong>. Estas son las piezas que se encontraron para cambio y que ya se solicitan a compras.</p><h4>El código interno Farmacápsulas</h4><p>Cada repuesto tiene <strong>dos identificaciones</strong> y hay que usar la correcta según con quién se hable:</p><ul><li><strong>Código interno Farmacápsulas</strong> (ej. <code>741203262</code>): es el que maneja la empresa en almacén y en la solicitud de compra. Es el que se escribe en el pedido interno.</li><li><strong>Código Bosch</strong> (ej. <code>8-108-136-292</code>): es el del fabricante y el que aparece en el catálogo de repuestos y en el E-Portal. Es el que se le pide a Bosch.</li></ul><p>En el <strong>despiece interactivo</strong> (pestaña <em>Despiece</em>) cada fila muestra ahora las dos: el código interno va en la primera columna y se puede escribir o corregir tocándolo, y el buscador acepta cualquiera de los dos. La letra entre corchetes es la clase de desgaste del catálogo Bosch: <strong>[A]</strong> pieza de desgaste, <strong>[B]</strong> pieza de repuesto.</p><h4>Piezas encontradas en la inspección</h4><div class="table-container"><table class="crit-table"><tbody><tr><th>Cód. interno Farmacápsulas</th><th>Código Bosch</th><th>Descripción</th><th>Cant.</th><th>Ubicación en el catálogo</th><th>Observación</th></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">724002338</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-104-238-784</td><td>Cobertura de alimentación Bosch (<em>Zufuehrrohr Abdeckung</em>)</td><td style="font-weight:700">1</td><td>Alimentación del polvo (grupo básico) — pág. 53</td><td>Sólo aparece en el plano del catálogo, no en la lista A/B/C.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">724002339</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-128-628 <small>[A]</small></td><td>O-Ring alimentador 60,2x3,0 · 70MVQ 11507/FDA</td><td style="font-weight:700">1</td><td>Alimentación del polvo (grupo básico) — pág. 53</td><td>Pieza de desgaste clase A. Se cambia junto con el tubo y la cobertura.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">724002340</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-104-503-671</td><td>Tubo de alimentación de polvo (<em>Pulverzufuehrrohr</em>)</td><td style="font-weight:700">1</td><td>Alimentación del polvo (grupo básico) — pág. 53</td><td>Sólo aparece en el plano del catálogo, no en la lista A/B/C.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">7240022312</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-104-307-689</td><td>Soporte de raspador (<em>Haltearm für Abstreifer FL</em>)</td><td style="font-weight:700">1</td><td>Soporte para rascador completo — pág. 84</td><td>Sólo aparece en el plano del catálogo, no en la lista A/B/C.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">721703041</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-168-189 <small>[B]</small></td><td>Presostato diferencial LGW 10 A2 (Dungs)</td><td style="font-weight:700">1</td><td>Estación de cierre (grupo básico) — pág. 106</td><td>Etiqueta de máquina =GKF1.G05-B13.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">741203258</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-136-291 <small>[A]</small></td><td>Correa dentada Z=160 · 1280-8M-50</td><td style="font-weight:700">1</td><td>Accionamiento estación de dosificación de polvo — pág. 41</td><td>Tensión 154 Hz ±5 Hz.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">741203259</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-148-303 <small>[A]</small></td><td>Correa dentada CXP 8M-960-50 HTD</td><td style="font-weight:700">2</td><td>Accionamiento principal — pág. 36 / Est. dosificadora desconectable — pág. 129</td><td>La misma referencia se monta en dos sitios; por eso van 2.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">741203260</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-137-973 <small>[A]</small></td><td>Correa dentada Z=228 · 684-3M-9</td><td style="font-weight:700">1</td><td>Accionamiento est. dosificadora desconectable — pág. 129</td><td>Tensión 90 Hz ±5 Hz (rueda tensora).</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">741203261</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-136-023 <small>[A]</small></td><td>Correa dentada 10T5/885</td><td style="font-weight:700">1</td><td>Regulación del disco dosificador por motor — pág. 136</td><td>—</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">741203262</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-136-292 <small>[A]</small></td><td>Correa dentada Z=150 · 1200-8M-30</td><td style="font-weight:700">1</td><td>Accionamiento principal — pág. 35</td><td>Tensión 154 Hz ±5 Hz.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">724002341</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-101-210-194 <small>[A]</small></td><td>Casquillo deslizante de collarín XFM-0405-06 (igus)</td><td style="font-weight:700">18</td><td>Estación de expulsión de cápsulas conformes — pág. 111</td><td>Se cambia en conjunto con el anillo rascador 8-104-236-330 y el casquillo de bolas 8-108-100-311.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">724002342</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-160-149 <small>[B]</small></td><td>Manguera de aspiración 38x1,5</td><td style="font-weight:700">4 <small>(aspiración)</small><br>8 <small>en toda la máquina</small></td><td>Aspiración — pág. 81 · también cierre, limpieza de segmentos y expulsión de defectuosas</td><td>El catálogo la reparte así: 4 en aspiración + 2 en cierre + 1 en cápsula defectuosa + 1 en limpieza de segmentos.</td></tr><tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:800">724002343</td><td style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:0.82rem">8-108-148-977 <small>[A]</small></td><td>Manguera AIRDUC PUR 351 EL 70x4,5 (Norres)</td><td style="font-weight:700">1</td><td>Aspiración (grupo básico) — pág. 81</td><td>La misma referencia aparece también en el despiece de montaje y en la aspiración de polvo.</td></tr></tbody></table></div><div class="alert-box">Tres de estas referencias (<code>8-104-238-784</code>, <code>8-104-503-671</code> y <code>8-104-307-689</code>) <strong>no están en las listas A/B/C del catálogo</strong>: sólo figuran rotuladas en el plano de despiece. Ya quedaron cargadas en el explorador, marcadas como <em>plano</em>, para poder pedirlas sin volver a buscar en el PDF.</div><div class="alert-box" style="background:#eef4ff;border-color:#cdddff">Al cambiar cualquier correa dentada hay que hacer después la <strong>puesta a cero de los servoaccionamientos</strong>, y sólo por personal formado: una puesta a cero incorrecta provoca colisiones y dosificaciones erróneas.</div>
              `
            },
            {
              id: "gkf-lubricacion",
              title: "Lubricación",
              content: `
<table class="crit-table"><tbody><tr><th>Punto</th><th>Producto</th><th>Código / referencia</th><th>Frecuencia</th></tr><tr><td><strong>Árboles de guía de la concentricidad de segmento, estación de clasificación, estación de separación, exploración de la parte superior, estación dosificadora, estación de cápsulas defectuosas, estación de cierre y estación de limpieza</strong></td><td>Cassida Grease EPS 1 (capa fina)</td><td>Eliminar la grasa usada y limpiar antes de aplicar. Págs. 550-567</td><td>Semanal (cada 40 h)</td></tr><tr><td><strong>Guía de la corredera de clasificación (boquilla/racor de engrase bajo la caperuza deslizante)</strong></td><td>Cassida Grease EPS 1 — 1 a 2 emboladas con engrasadora</td><td>Limpiar el racor antes de engrasar y retirar la grasa sobrante; no apretar la junta al colocar la caperuza. Pág. 551</td><td>Mensual (cada 160 h)</td></tr><tr><td><strong>Superficie de rodadura del cojinete de la estación de clasificación</strong></td><td>STABYL 300 AL 2 (capa fina)</td><td>Pág. 551</td><td>Mensual (cada 160 h)</td></tr><tr><td><strong>Superficies de rodadura de todas las poleas</strong></td><td>STABYL 300 AL 2 (capa fina)</td><td>Pág. 547</td><td>Mensual (cada 160 h)</td></tr><tr><td><strong>Pista de levas y rodillo de leva de la estación de llenado de pellets</strong></td><td>STABYL 300 AL 2</td><td>Con el accionamiento desmontado (5 tornillos de la parte superior). Pág. 557</td><td>Mensual (cada 160 h)</td></tr><tr><td><strong>Árboles de guía bajo el anillo de protección de la estación de llenado y taladros de la leva de corredera</strong></td><td>Árboles: Cassida Grease EPS 1 (capa fina) · Taladros: STABYL 300 AL 2 (llenar)</td><td>Anillo de protección con 3 tornillos que lo levantan al desenroscar y lo presionan al apretar. Pág. 561</td><td>Mensual (cada 160 h)</td></tr><tr><td><strong>Superficies de rodadura de la protección contra torsión de la estación de cápsulas defectuosas y de la estación de cierre</strong></td><td>STABYL 300 AL 2 (capa fina)</td><td>Págs. 564 y 566</td><td>Mensual (cada 160 h)</td></tr><tr><td><strong>Husillo de ajuste de los pasadores de separación</strong></td><td>Cassida Grease EPS 1 (capa fina)</td><td>Pág. 555</td><td>Trimestral (cada 500 h)</td></tr><tr><td><strong>Riel de guía del accionamiento de la estación dosificadora</strong></td><td>STABYL 300 AL 2 — película fina aplicada con pincel fino</td><td>Eliminar la grasa usada y limpiar antes. Pág. 454</td><td>Según necesidad (en cada montaje del accionamiento)</td></tr><tr><td><strong>Árboles de guía de la brida de corredera del accionamiento de la estación dosificadora</strong></td><td>Cassida Grease EPS 1 (capa fina)</td><td>¡ATENCIÓN! En estos árboles NO debe haber STABYL 300 AL 2. Pág. 454</td><td>Según necesidad (en cada montaje del accionamiento)</td></tr><tr><td><strong>Superficies de guía de la placa de llenado y de las correderas de dosificación superior e inferior (estación de pellets)</strong></td><td>Cassida Grease EPS 1 — capa muy fina</td><td>Pág. 469</td><td>Según necesidad (en cada ensamblaje del bloque de guía)</td></tr><tr><td><strong>Resortes de los pernos de presión del portapistón de compresión (18 por portapistón)</strong></td><td>Aceite con homologación H1 FDA/USDA — lubricar ligeramente</td><td>Pág. 433</td><td>Según necesidad (en cada ensamblaje de los bloques de pistones)</td></tr><tr><td><strong>Motor de engranaje cónico Lenze GKR04-2M de la alimentación de polvo</strong></td><td>Cambio de lubricante según documentación del fabricante (tarjeta USB)</td><td>Verificar además los anillos-retén y reemplazarlos si presentan fugas. Ref. 8-108-170-987. Pág. 531</td><td>Por horas: 10000 h</td></tr><tr><td><strong>Mecanismo paso a paso de la dosificación HTSG 133-6-H150</strong></td><td>Verificación del nivel de aceite</td><td>Comprobar además obturaciones, cojinetes y engranajes (sobrecalentamiento, ruidos, juego). Ref. 8-104-242-001. Pág. 530</td><td>Por horas: 5000 h</td></tr><tr><td><strong>Partes de la máquina brillantes o móviles / piezas de metal brillantes para almacenamiento</strong></td><td>Lubricante ligero · película de aceite libre de ácido para protección anticorrosiva</td><td>Evitar todo desengrase completo tras la limpieza previa a la puesta en servicio; antes de un almacenamiento prolongado proteger las piezas brillantes. Págs. 43 y 48</td><td>Según necesidad</td></tr></tbody></table><div class="alert-box">Usa <strong>solo lubricantes aptos para la industria farmacéutica</strong> (grado alimentario/NSF H1) en los puntos en contacto con el producto, y respeta los indicados por Bosch.</div>
              `
            },
            {
              id: "gkf-parametros",
              title: "Parámetros y tolerancias de ajuste",
              content: `
<p>Valores de ajuste y tolerancias que da el manual. Son los números que hay que respetar al calibrar.</p><table class="crit-table"><tbody><tr><th>Parámetro</th><th>Valor</th><th>Tolerancia / rango</th><th>Fuente</th></tr><tr><td><strong>Presión de entrada de aire comprimido</strong></td><td>Máx. 8 bar</td><td>Máximo admisible</td><td>pág. 44 / 100</td></tr><tr><td><strong>Presión regulada en la unidad de mantenimiento</strong></td><td>≈6,5 bar (cap. 5) / comprobar ≈6 bar (cap. 6)</td><td>Valor máximo admisible 7 bar</td><td>pág. 100 / 328</td></tr><tr><td><strong>Calidad del aire comprimido ISO 8573-1</strong></td><td>Clase 6-4-1: sólidos ≤5 mg/m³ y ≤5 µm · punto de rocío ≤3 °C · aceite ≤0,01 mg/m³</td><td>Requisito contractual</td><td>pág. 43</td></tr><tr><td><strong>Vacío de la estación de separación</strong></td><td>Ajuste inicial −0,1 bar</td><td>Aumentar en pasos pequeños hasta máx. −0,4 bar</td><td>pág. 396</td></tr><tr><td><strong>Presión de los bloques de pistones de compresión (regulación neumática)</strong></td><td>3 bar</td><td>Ajustable con Pres. pistón compr. +/−; manómetro local 0–25 bar</td><td>pág. 108 / 134</td></tr><tr><td><strong>Elevación de los pasadores de separación</strong></td><td>1 – 2 mm sobre el segmento portacápsulas inferior</td><td>—</td><td>pág. 393</td></tr><tr><td><strong>Ajuste básico de los pasadores de separación (cabezal digital en 0, tope mecánico)</strong></td><td>Cota A = 26,0 mm · Cota B = 19 mm</td><td>La cota B sólo con pasadores estándar L = 46 mm</td><td>pág. 395</td></tr><tr><td><strong>Tabla de ajuste de pasadores de separación por tamaño de cápsula</strong></td><td>Cabezal digital 0/12/16/24/32/42/45/56/75 → Cota A 26,0/24,6/23,8/22,8/21,6/20,3/19,8/18,4/15,8 mm → Cota B 19,0/17,4/16,8/15,8/14,6/13,3/12,9/11,4/8,8 mm</td><td>Verificar en el PDF original la asignación exacta de cada tamaño de cápsula a su columna</td><td>pág. 394</td></tr><tr><td><strong>Empuje de la corredera de clasificación</strong></td><td>1 – 2 mm de la tapa fuera del bloque clasificador</td><td>Determinar por marchas de prueba</td><td>pág. 388</td></tr><tr><td><strong>Distancia disco dosificador – anillo de apriete</strong></td><td>Ajuste básico corredera + 0,05 mm</td><td>1 raya de graduación = 0,01 mm · polvo pegajoso +0,1 mm · polvo aireado +0,02/0,03 mm · repetir el control 5 veces</td><td>pág. 417</td></tr><tr><td><strong>Distancia disco dosificador – separador de producto</strong></td><td>0,05 mm (calibrador de espesores de 0,05 mm)</td><td>Mínimo 0,05 mm en cada punto</td><td>pág. 426</td></tr><tr><td><strong>Altura del disco dosificador fijo</strong></td><td>3 – 14 mm (interruptor Disco dosificador fijo / cabezal 0107.0) · 14,1 – 27 mm (Disco dosificador fijo 2 / cabezal 0232.0)</td><td>Interruptores activos sólo en marcha paso a paso</td><td>pág. 419 / 425</td></tr><tr><td><strong>Ajuste básico del disco dosificador ajustable</strong></td><td>Distancia G = 26,4 mm; cabezal digital 0106.0 (mecánico) o altura actual 0 mm (eléctrico). D = H x 10</td><td>1 unidad del cabezal ≈ 0,1 mm</td><td>pág. 443-444</td></tr><tr><td><strong>Valores del disco dosificador ajustable por tamaño de cápsula (H_OT/H_UT/L_Casquillo/Hmín/Hmáx/carrera/Dmín/Dmáx/Vmín/Vmáx)</strong></td><td>00: 4/14,8/10,7 · 18,8–24,5 mm · 5,7 · 188–245 · 0,674–0,902 ml || 0: 4/13,7/11,1 · 17,7–23,8 · 6,1 · 177–238 · 0,487–0,680 ml || 1: 4/12,6/10,4 · 16,6–22,0 · 5,4 · 166–220 · 0,362–0,499 ml || 2: 4/11,7/8,6 · 15,7–19,3 · 3,6 · 157–193 · 0,293–0,371 ml || 3: 4/9,8/10,2 · 13,8–19,0 · 5,2 · 138–190 · 0,204–0,300 ml || 4: 4/7,7/10,7 · 11,7–17,4 · 5,7 · 117–174 · 0,127–0,211 ml</td><td>Discos especiales: Hmín = H_OT+H_UT; Carrera = L_Casquillo−(H_OT+1); Hmáx = Hmín+carrera; D = H x 10</td><td>pág. 445</td></tr><tr><td><strong>Margen de volumen del disco dosificador con ajuste</strong></td><td>t4 130–210 mm³ · t3 200–300 · t2 290–370 · t1 360–500 · t0 490–680 · t00 670–920 mm³</td><td>—</td><td>pág. 449</td></tr><tr><td><strong>Ajuste básico de los pistones de compresión (ejemplo disco 16,5 mm)</strong></td><td>Punto 1 ≈8 mm · 2 ≈9–10 · 3 ≈11–12 · 4 ≈13–14 · 5 ≈15,5–16,5 mm</td><td>Valores de experiencia, no válidos para todos los productos; en el punto 5 al ras o hundidos ≈1 mm</td><td>pág. 440-441</td></tr><tr><td><strong>Resortes de los pistones de compresión (1 a 4)</strong></td><td>Ø cable 0,8/1,6/2,0/2,4 mm · L0 45,6/40,5/39/39 mm · fuerza máx. 5/64/105/200 N · tasa 0,42/6,75/17,5/40,2 N/mm · material 1.4310</td><td>Elevación útil máxima 9/6/4/3 mm — no sobrepasar, el resorte se rompe. Resortes 2 y 3 estándar; el 4 sólo en los puntos de compresión 4 y 5</td><td>pág. 442</td></tr><tr><td><strong>Ranura inserto de tolva – corredera de dosificación (pellets)</strong></td><td>Ø>1,2 mm→0,5 mm (H2,5) · 0,9–1,2→0,4 (H2,4) · 0,7–0,9→0,3 (H2,3) · 0,5–0,7→0,2 (H2,2) · 0,3–0,5→0,1 (H2,1) · <0,3→0,03 (H2,03)</td><td>La fijan los 4 anillos distanciadores</td><td>pág. 468</td></tr><tr><td><strong>Volumen de dosificación de pellets</strong></td><td>Ranura mínima entre correderas 0,05 mm</td><td>No superar la carrera máxima grabada en la corredera superior (H = x). Marcas del tornillo = 0,1 mm; 1 raya de escala = 1 mm</td><td>pág. 474</td></tr><tr><td><strong>Estación de cierre — saliente de la cápsula</strong></td><td>1,0 – 1,5 mm sobre la parte superior de segmento</td><td>—</td><td>pág. 497</td></tr><tr><td><strong>Estación de cierre — distancia contrasoporte / cápsula</strong></td><td>Contrasoporte a parte superior de segmento 1,0–1,5 mm; cápsula cerrada a contrasoporte mín. 0,5 mm</td><td>Mín. 1 mm al subir el contrasoporte; los pasadores no deben presionar la cápsula</td><td>pág. 498-499</td></tr><tr><td><strong>Tensión de correas dentadas (frecuencia)</strong></td><td>Accionamiento principal 154 Hz · segmentos 90 Hz · estación dosificadora 90 Hz (rueda tensora) y 154 Hz (tornillo tensor)</td><td>±5 Hz — ¡no tensar demasiado!</td><td>pág. 548-549 / 558-559</td></tr><tr><td><strong>Pares de apriete del accionamiento de la estación dosificadora</strong></td><td>Anillo básico 5 tornillos 40 Nm · riel de guía 6 tornillos 9 Nm · brida de corredera 3 tornillos 40 Nm</td><td>Los 6 tornillos de la placa base del traspaso de pastillas se aprietan en cruz (sin par indicado)</td><td>pág. 454-455 / 484</td></tr><tr><td><strong>Velocidad GKF en servicio de marcha a pasos (preparación)</strong></td><td>20 piezas/minuto</td><td>Se ajusta pulsando la velocidad en la cabecera</td><td>pág. 106</td></tr><tr><td><strong>Temperatura ambiente de la máquina y altitud</strong></td><td>+10 a +30 °C · HR máx. 50 % a 30 °C · hasta 2000 m sobre el nivel del mar</td><td>Rango admisible de servicio</td><td>pág. 63</td></tr><tr><td><strong>Condiciones de las cápsulas de gelatina dura</strong></td><td>+18 a +20 °C y 40–50 % HR</td><td>Prohibido introducir cápsulas frías</td><td>pág. 63</td></tr><tr><td><strong>Condiciones de almacenamiento de la máquina</strong></td><td>+5 a +35 °C y 30–60 % HR, local seco y limpio, suelo plano</td><td>Proteger las piezas brillantes con película de aceite libre de ácido</td><td>pág. 48</td></tr><tr><td><strong>Temperatura máxima admisible en el armario eléctrico</strong></td><td>45 °C</td><td>Ajustable en el regulador de temperatura</td><td>pág. 327</td></tr><tr><td><strong>Nivel de intensidad acústica LpAeq</strong></td><td>< 70 dB(A) a 1 m de distancia y 1,6 m de altura</td><td>Según DIN 45 635 partes 1 y 28, clase 2</td><td>pág. 49</td></tr><tr><td><strong>Aire de transporte de cápsulas vacías</strong></td><td>≈0,2 bar</td><td>Máximo admisible 0,5 bar; manguera Ø interior mín. 9 mm</td><td>pág. 578</td></tr><tr><td><strong>Puesta a cero de servoaccionamientos</strong></td><td>Accionamiento principal: indicador a 0° · estación de pastillas: girar el disco hasta que la PRIMERA pastilla caiga al pozo de descarga · estación de pellets: árbol calibre de Ø4 mm en el taladro</td><td>Modo 508 Accionamientos cero; sólo tras cambio de correas o reparaciones mayores</td><td>pág. 260-266</td></tr><tr><td><strong>Presión máxima del engrasador de alta presión</strong></td><td>1000 kPa (10 bar / 145 psi)</td><td>No sobrepasar</td><td>pág. 515</td></tr><tr><td><strong>Limpieza en lavadora industrial (piezas de aluminio recubiertas)</strong></td><td>Lavado máx. 60 °C · secado máx. 75 °C · detergente pH 5–8</td><td>Detergentes ácidos o alcalinos y temperaturas altas dañan el recubrimiento</td><td>pág. 517</td></tr><tr><td><strong>Limpieza con ultrasonidos</strong></td><td>Tickopur RP 100A ½ copa/litro · ≈50 °C · mín. 5 minutos</td><td>Las piezas revestidas NO se limpian en ultrasonidos (número en negrita/cursiva en el catálogo)</td><td>pág. 536</td></tr><tr><td><strong>Peso del anillo de apoyo / anillo de apriete</strong></td><td>≈20 kg</td><td>Montaje y desmontaje entre al menos dos personas, con los segmentos desmontados</td><td>pág. 412 / 415</td></tr><tr><td><strong>Contadores de predefiniciones (fallos de suma)</strong></td><td>N.º 2 Fallo de suma segmento · N.º 3 limpieza del almacén (ASB) · N.º 4 exploración parte superior · N.º 5 exploración parte inferior</td><td>Entrada 0 = función desconectada</td><td>pág. 187</td></tr><tr><td><strong>Longitud máxima de informe y directorios de datos</strong></td><td>5000 líneas por informe · backup de recetas C:\\Customer\\Bosch_Backup\\30 HMI\\Data · lotes c:\\Customer\\BatchBackup · ZIP = ID de lote + fecha + hora</td><td>Imprecisión de los registros de tiempo hasta 2 minutos (técnica Windows); en el cambio de hora ningún lote debe estar iniciado</td><td>pág. 121 / 132 / 205 / 215 / 281</td></tr><tr><td><strong>Número de cavidades y pistas</strong></td><td>18 cápsulas por ciclo: hileras 1/1…1/9 y 2/1…2/9 · 12 soportes de segmento · 5 puntos de compresión + punto de traspaso (108 pistones por juego de formato)</td><td>—</td><td>pág. 312-324 / 185-189</td></tr></tbody></table>
              `
            },
            {
              id: "gkf-cambio-formato",
              title: "Cambio de formato y de producto",
              content: `
<p>Esta máquina tiene piezas de formato para los tamaños <strong>0, 1, 2 y 3</strong>. El cambio de formato es la operación más frecuente y delicada: hazla con la máquina <strong>consignada (LOTO)</strong> y verifica al final girando a mano.</p><div class="step-card"><div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">0. Documentar los valores en la Lista de ajustes</span></div><div class="step-card__row"><span>Cómo</span><span>Anotar producto, tamaño de cápsula, peso nominal, nombre y versión de receta, altura de los pasadores de separación, distancia disco dosificador–anillo de apoyo, altura del disco dosificador, alturas de émbolo de compresión a/b/c/d/e, altura del sensor de producto, volumen de la cámara dosificadora de las estaciones 4, 6 y 8, aspiración de la estación de cápsulas no conformes, altura de los pasadores de cierre, altura del contrasoporte, vacío y aire comprimido. El resto de valores quedan guardados en el panel con la receta.</span></div><div class="step-card__params"><strong>Valores:</strong> Págs. 370-371</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">1. Secuencia general del cambio de producto</span></div><div class="step-card__row"><span>Cómo</span><span>1) Desmontar las partes en contacto con el producto. 2) Limpiar el recinto de producción y todas esas partes. 3) Fijar producto, dosis y tamaño de cápsula. 4) Preparar las piezas del formato (van identificadas con el tamaño de cápsula; los pistones llevan además S = disco fijo o V = disco ajustable). 5) Montar las partes. 6) Preparar la máquina (cap. 5).</span></div><div class="step-card__params"><strong>Valores:</strong> Pág. 372</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">2. Orden de DESMONTAJE (13 pasos)</span></div><div class="step-card__row"><span>Cómo</span><span>1 Estación de pellets (depósito, bloque de guiado y, si procede, accionamiento) · 2 Estación dosificadora (bloques de pistones o campanas, bloque de traspaso, tubo de alimentación y sensor, depósito de producto, anillo de guía + placa de cubierta + anillo de producto, separador de producto, chapas protectoras, disco dosificador y correderas) · 3 Aspiración y estribo de la estación de cápsulas defectuosas · 4 Contrasoporte · 5 Estación de pastillas · 6 Canaleta y reenvío · 7 Estación de clasificación (depósito de recogida, depósito de cápsulas vacías y placa intermedia, almacenes, bloques y correderas) · 8 Segmentos · 9 Pasadores de cierre · 10 Estación de separación · 11 Bloque y pasadores de limpieza · 12 Anillo de apoyo y aspiración de producto · 13 Limpiar.</span></div><div class="step-card__params"><strong>Valores:</strong> Págs. 373-376</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">3. Orden de MONTAJE (12 pasos)</span></div><div class="step-card__row"><span>Cómo</span><span>1 Aspiración de producto, anillo de apriete y su ajuste, correderas · 2 Pasadores y bloque de limpieza · 3 Pasadores de cierre · 4 Estación de separación · 5 Segmentos · 6 Estación de clasificación · 7 Reenvío y canaleta · 8 Ajustar pasadores de cierre y montar/ajustar el contrasoporte · 9 Estación de pastillas y su ajuste · 10 Estribo y aspiración de cápsulas defectuosas con su ajuste · 11 Estación dosificadora completa con ajuste de la altura de pistones, aire aspirado y altura del disco · 12 Estación de pellets con ajuste del volumen de dosificación.</span></div><div class="step-card__params"><strong>Valores:</strong> Págs. 377-379</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">4. Segmentos y estación de clasificación</span></div><div class="step-card__row"><span>Cómo</span><span>Los segmentos superior e inferior son piezas de formato con 1 tornillo cautivo cada una; se cambian estación por estación haciendo girar la máquina en paso a paso. Las correderas y bloques de clasificación son piezas de formato (1 tornillo cada una); montar las correderas primero, llevarlas a la posición trasera extrema y después los bloques. Los depósitos de cápsulas se montan con la liberación hacia el exterior; alinear la placa intermedia para que no toque los almacenes.</span></div><div class="step-card__params"><strong>Valores:</strong> Pernos enchufables del formato de segmento: 8-108-219-740 (t0), -750 (t1), -760 (t2), -770 (t3). Pasadores clasificadores: 8-104-237-234/235/236/237. Págs. 380-387</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">5. Ajuste del distribuidor clasificador y de la liberación de cápsulas</span></div><div class="step-card__row"><span>Cómo</span><span>Con cápsulas normalizadas no hace falta ajustar. Si no entran bien: en la posición delantera extrema, retirar la caperuza, soltar el tornillo, ajustar la colisa y apretar; comprobar que el cojinete se mueva libremente en todas las posiciones. Para la liberación, soltar los 2 tornillos de la leva: si salen 2 cápsulas por guía bajarla, si no sale ninguna subirla.</span></div><div class="step-card__params"><strong>Valores:</strong> Empuje 1–2 mm de la tapa fuera del bloque. Págs. 388-390</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">6. Estación de separación</span></div><div class="step-card__row"><span>Cómo</span><span>Montar resortes y manguitos, soporte de mordaza, manguitos distanciadores, placas de pasadores y por último las zapatas de aspiración (superficie de obturación plana y limpia). Comprobar la elevación con una cápsula en el segmento y los pasadores en su posición más alta; ajustar con el cabezal digital según la tabla de tamaños.</span></div><div class="step-card__params"><strong>Valores:</strong> Elevación 1–2 mm. Ajuste básico A = 26,0 mm / B = 19 mm con L = 46 mm y cabezal en 0. Vacío −0,1 bar hasta máx. −0,4 bar. Págs. 391-396</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">7. Anillo de apoyo y correderas de la estación dosificadora</span></div><div class="step-card__row"><span>Cómo</span><span>Montar el anillo de apoyo (≈20 kg, entre dos personas, con los segmentos desmontados) y ajustar con los tornillos de regulación la distancia al disco dosificador usando una galga; controlar en varios puntos, hacer un ciclo lento en paso a paso y repetir el procedimiento 5 veces. Montar las 6 correderas en su posición correcta (dos taladros y dos tornillos distintos; las de pellets son piezas de formato).</span></div><div class="step-card__params"><strong>Valores:</strong> Básico corredera +0,05 mm (1 raya = 0,01 mm). Págs. 411-418</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">8. Disco dosificador fijo o ajustable</span></div><div class="step-card__row"><span>Cómo</span><span>Fijo: conectar el interruptor 13 (3–14 mm) o 14 (14,1–27 mm), montarlo horizontal con los 6 tornillos SIN apretar, montar el anillo de guía con los pasadores hacia arriba, llevarlo a la posición inferior e insertar los pasadores de extracción (deben caer por su propio peso); orientar el disco, apretar y desmontar el anillo. Ajustable: desconectar ambos interruptores, introducir los datos grabados en las piezas en Receta > GKF > Llenado 5 > Disco dosificador, montar la parte inferior con la ranura a 90° respecto a las roscas, alinear igual, y montar la parte superior subiéndola hasta que exista una ranura claramente visible antes de apretar sus 2 tornillos.</span></div><div class="step-card__params"><strong>Valores:</strong> Si no queda esa ranura los tornillos se aflojan y se dañan la máquina. Págs. 419-423</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">10</span><span class="step-card__title">9. Chapas protectoras, separador de producto y anillo de producto</span></div><div class="step-card__row"><span>Cómo</span><span>Comprobar la junta tórica del disco (cambiarla si está dañada) e insertarla en la ranura. Ensamblar el separador de producto (con elemento de pellets en dosificación de pellets), encajarlo hasta el tope y ajustar con calibrador de 0,05 mm la distancia al disco; comprobar en varios puntos en paso a paso y apretar el tornillo con la tuerca. Después montar anillo de producto, placa cubierta y anillo de guía con placas de presión.</span></div><div class="step-card__params"><strong>Valores:</strong> Mínimo 0,05 mm en cada punto. Cabezales 0107.0 (3–14 mm) y 0232.0 (14,1–27 mm). Págs. 424-427</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">11</span><span class="step-card__title">10. Depósito de producto, sensor y árbol transportador</span></div><div class="step-card__row"><span>Cómo</span><span>Accionar la PARADA DE EMERGENCIA. Colocar el anillo de junta, insertar el árbol en el depósito (en polvo desde arriba, en pellets desde abajo), enganchar el depósito y engatillar el casquillo en el cierre de bayoneta; montar la ventanilla con los sensores y enchufar sus líneas. Ajustar la altura del sensor de producto (depende del producto) y montar el tubo de alimentación con su brida.</span></div><div class="step-card__params"><strong>Valores:</strong> Págs. 428-430</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">12</span><span class="step-card__title">11. Bloque de traspaso y campanas de pistones</span></div><div class="step-card__row"><span>Cómo</span><span>Insertar los 18 pistones (identificados con S o V + formato) en el bloque de traspaso, deslizar el peine y apretar el tornillo. Ensamblar cada portapistón lubricando ligeramente los resortes con aceite H1 FDA/USDA, insertando pernos, resortes (escalonamiento según producto), placa de cubierta, cilindros neumáticos (opción), pistones, peine y capota; apretar la ventanilla con sumo cuidado. En pellets se montan 2 campanas en lugar de los bloques. Después dar un ciclo lento de control.</span></div><div class="step-card__params"><strong>Valores:</strong> 18 pistones, 18 resortes, 18 pernos y 18 cilindros por portapistón; 5 bloques con 6 mandos de muletilla; tuberías de aire en los bloques 3 y 4. Págs. 431-436</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">13</span><span class="step-card__title">12. Ajuste del árbol transportador y del aire de aspiración</span></div><div class="step-card__row"><span>Cómo</span><span>Polvo: si el producto se pega, bajar el agitador; si gira, subirlo; si no llega al sinfín, girar la rueda de paletas. Pellets: añadir o quitar discos para variar la distancia A del disco de retención. Ni el agitador ni el disco de retención deben tocar el depósito. Ajustar el aire aspirado con la válvula y la aspiración de la estación 6 con la corredera de cierre.</span></div><div class="step-card__params"><strong>Valores:</strong> Págs. 437-439</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">14</span><span class="step-card__title">13. Ajuste de los pistones de compresión</span></div><div class="step-card__row"><span>Cómo</span><span>Ajustar el punto de compresión 5 de modo que los pistones queden al ras del canto superior del disco o se hundan hasta ≈1 mm; realizar funcionamientos de prueba pesando cápsulas y corregir el peso en los puntos 3 y 4 (a más inmersión, más peso). Escalonar los puntos 2, 3 y 4 entre los valores del 1 y del 5.</span></div><div class="step-card__params"><strong>Valores:</strong> Ejemplo con disco 16,5 mm: 8 / 9–10 / 11–12 / 13–14 / 15,5–16,5 mm. Págs. 440-441</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">15</span><span class="step-card__title">14. Estación de llenado de pellets</span></div><div class="step-card__row"><span>Cómo</span><span>Montar los 4 anillos distanciadores en el inserto de tolva según el Ø del pellet, deslizarlo en la guía de tolva y atornillar. Engrasar con capa muy fina (Cassida EPS 1) las superficies de guía de placa de llenado y correderas; con los pernos de accionamiento desplegados, colocar la llave M10, insertar el bloque de guía hasta que los pernos encajen en la corredera inferior, montar la corredera superior y deslizar la guía de tolva hasta el tope. Ajustar el volumen con el tornillo de ajuste.</span></div><div class="step-card__params"><strong>Valores:</strong> Ranura 0,03–0,5 mm según Ø de pellet; ranura mínima entre correderas 0,05 mm; no superar la carrera máxima grabada. Págs. 462-474</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">16</span><span class="step-card__title">15. Estación de llenado de pastillas</span></div><div class="step-card__row"><span>Cómo</span><span>Montar la placa base con el diente marcado entre los dientes marcados de la corona dentada y apretar sus 6 tornillos en cruz; comprobar que el borde superior de la corona quede por encima de la placa de cubierta. Montar el disco dosificador y el pozo de traspaso (piezas de formato) y colocar unidad de toberas (11 h), soporte y sensor (4 h), rascador (5 h) y tobera de limpieza (9 h). Ajustar altura y posición de los rascadores, el nivel de producto con el sensor y las presiones desde el HMI.</span></div><div class="step-card__params"><strong>Valores:</strong> Ajustar sin cápsulas ni otro producto, en pasos pequeños: subir desde nivel bajo y bajar desde presión alta. Págs. 475-494</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">17</span><span class="step-card__title">16. Estación de cierre</span></div><div class="step-card__row"><span>Cómo</span><span>Con los segmentos de la estación desmontados, montar los pasadores de cierre, colocar cápsulas cerradas en un segmento y, con los pasadores en su punto más alto, ajustar con el tornillo de ajuste hasta que la cápsula sobresalga 1,0–1,5 mm. Después montar el contrasoporte dejando al subirlo mín. 1 mm de distancia, ajustarlo a 1,0–1,5 mm del segmento y comprobar que la cápsula cerrada quede a mín. 0,5 mm sin que los pasadores presionen; si es menor, subir de forma uniforme contrasoporte y pasadores.</span></div><div class="step-card__params"><strong>Valores:</strong> Escala 5 = contrasoporte, escala 6 = pasadores de cierre. Págs. 495-499</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">18</span><span class="step-card__title">17. Expulsión, limpieza y ajuste de la estación de cápsulas no conformes</span></div><div class="step-card__row"><span>Cómo</span><span>Montar desviación y guía de cápsulas (piezas de formato), tubuladura y canaleta; montar pasadores y bloque de limpieza con los segmentos desmontados. Ajustar la aspiración de cápsulas no conformes soltando la empuñadura en estrella y moviendo la corredera.</span></div><div class="step-card__params"><strong>Valores:</strong> Ajuste correcto: se aspiran todas las cápsulas subidas y no se aspira ninguna tapa correcta. Págs. 457-461 / 500-507</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">19</span><span class="step-card__title">18. Datos de formato en la receta y prueba final</span></div><div class="step-card__row"><span>Cómo</span><span>Introducir el tamaño de cápsula en Datos de producto, conectar/desconectar las estaciones de llenado (Ninguna / Pellets / Pastillas / Polvo), declarar el disco dosificador montado, ajustar el tipo de estación, la división del disco de pastillas, la zona de llenado y el valor de corrección para el segmento (estándar 0,0°; negativo = rellena antes, positivo = más tarde). Activar la versión de receta y hacer marchar la máquina lentamente en paso a paso comprobando la ausencia de colisiones y el peso de las cápsulas.</span></div><div class="step-card__params"><strong>Valores:</strong> Preparación completa: cap. 5 pág. 19 (105-114 del PDF)</div></div>
              `
            },
            {
              id: "gkf-sistemas",
              title: "Sistemas y componentes",
              content: `
<table class="crit-table"><tbody><tr><th>Sistema</th><th>Descripción</th><th>Componentes</th></tr><tr><td><strong>Estaciones 1 y 2 — Clasificación y separación</strong></td><td>Alimentación, orientación e introducción de cápsulas en los segmentos y apertura de la cápsula por vacío. Doble línea.</td><td>Depósito de cápsulas vacías, almacenes con liberación, bloque clasificador, correderas y resbaladores de clasificación, carro KWSE20 sobre riel TKSD 20/130, zapatas de aspiración, pasadores de separación ajustables, bloques de separación 1.ª y 2.ª estación, sensor ultrasónico</td></tr><tr><td><strong>Estación 3/4/7 — Exploración de cápsula</strong></td><td>Palpado de presencia de tapa y cuerpo en cada taladro; alternativa: control en proceso (IPK, balanza).</td><td>Pasadores de exploración, casquillos deslizantes y muelles, 18 sensores IQ08-02BPSKT0 / IFS 5036, contadores de fallo de suma</td></tr><tr><td><strong>Estación 5 — Estación dosificadora (polvo / pellets / líquido)</strong></td><td>Dosificación principal: compacta polvo en 5 puntos de compresión o dosifica pellets por el taladro del disco.</td><td>Depósito de producto 1, árbol transportador (agitador, rueda de paletas, sinfín D55), disco dosificador fijo o ajustable, anillo de producto y placa cubierta, anillo de apoyo/apriete ~20 kg, 6 correderas, separador de producto, 5 campanas de pistones (18 pistones c/u), bloque de traspaso, anillo de guía con casquillos, aspiración central</td></tr><tr><td><strong>Estaciones 4, 6 y 8 — Estaciones de llenado</strong></td><td>Llenado adicional de pellets o pastillas; hasta 11 variantes de llenado combinables.</td><td>Depósitos de producto 2 y 3, corredera giratoria, tubos de alimentación, bloque de guía con placa de llenado y correderas de dosificación, vibrador con placa de cierre, disco dosificador de pastillas, pozo de traspaso, unidad de toberas, tobera de limpieza, barra de ionización (opción), servoaccionamientos</td></tr><tr><td><strong>Estación 9 — Cierre</strong></td><td>Cierre de la cápsula con detección de mitades faltantes.</td><td>Portaempujadores con 18 empujadores de cierre, placa de cierre con árbol, contrasoporte con sensores, escalas de ajuste, presostato diferencial LGW 10A2</td></tr><tr><td><strong>Estaciones 10 y 11 — Expulsión</strong></td><td>Salida de las cápsulas conformes y separación del rechazo.</td><td>18 pasadores expulsores con protección de sobrecarga, 18 espigas de evacuación con cilindro y sensor, isla de válvulas AV03 20 vías, desviación y guía de cápsulas (formato), canaleta con brida</td></tr><tr><td><strong>Estación 12 — Limpieza de segmentos</strong></td><td>Limpieza de los taladros de los segmentos y retirada del rechazo.</td><td>Portatoberas con 18 punzones Ø4 mm, bloques de limpieza superior e inferior, válvula 5/2 vías, expulsor por impulsos R495</td></tr><tr><td><strong>Concentricidad de segmento (transporte)</strong></td><td>Giro indexado y desplazamiento horizontal de los segmentos portacápsulas.</td><td>Portasegmentos, mecanismo paso a paso 8-104-234-308, 48 casquillos 12/19X28 y 24 casquillos 20/28X30, 12 soportes superiores y 12 fijadores inferiores, 12 arrastradores, estrella de guía, leva de desplazamiento, junta de mesa</td></tr><tr><td><strong>Accionamiento principal</strong></td><td>Cadena cinemática y sincronización de toda la máquina.</td><td>Servomotor SH140/30200, reductor PLN115-12, correas dentadas, árboles principales, discos de leva (cierre, no conformes, clasificación), rodillos de pinza, encoder AFS60A y encoder de concentricidad, freno de retención</td></tr><tr><td><strong>Vacío</strong></td><td>Genera y vigila el vacío de separación.</td><td>Bomba ELMO-G 2BH7420, filtro G2½" con cartucho Micro-Top C 15-124/1, válvula reguladora, interruptor de presión, mangueras 30x5 y Truflex 20x4</td></tr><tr><td><strong>Neumática</strong></td><td>Preparación y distribución del aire comprimido.</td><td>Válvula de bloqueo, filtro-regulador G1/2 con manómetro 0–16 bar, válvula 3/2 de arranque/purga con silenciadores, interruptor de presión, islas de válvulas AV03 (11 y 20 vías), válvula proporcional ED02, tubos PA11 y PUR</td></tr><tr><td><strong>Aspiración de polvo</strong></td><td>Extracción del polvo de proceso y del rechazo.</td><td>Aspiradora Krahnen ES VA 2/820 (230 V, 60 Hz), mangueras AIRDUC PUR 351 EL 70x4,5 con abrazaderas puestas a tierra, tolva y bloque de aspiración, presostato diferencial</td></tr><tr><td><strong>Control y HMI</strong></td><td>Gobierno, recetas, lotes, diagnóstico y Audittrail.</td><td>Controller Elau LMC400, PC industrial VPB40.3, servoamplificador LXM62, PLC de seguridad PLUTO B46 V2, SAI VAU01.1U, panel táctil, EtherCAT, teleservicio con interruptor de llave</td></tr><tr><td><strong>Seguridad</strong></td><td>Protección de personas y vigilancia de estados.</td><td>8 puertas/cubiertas vigiladas, 4 interruptores TV10S con adaptadores Tina 3A, sensores Adam/Eva, muelles de gas 1150 N, pulsadores de PARADA DE EMERGENCIA (manejo y máquina), semáforo con avisador acústico, interruptor principal enclavable</td></tr><tr><td><strong>Armario eléctrico y refrigeración</strong></td><td>Alojamiento del control y climatización.</td><td>Ventilador con filtro Rittal SK 3241.124, equipo de refrigeración +S200 SK 3201.300 (100 W, 24 V DC), regulador de temperatura, fusibles W00-F203/F302/F303/F304/F307/F308/F310/F311/F312/F314/F510, guardamotores y contactores</td></tr></tbody></table>
              `
            },
            {
              id: "gkf-seguridad",
              title: "Seguridad y bloqueo de energía (LOTO)",
              content: `
<h4>Bloqueo y consignación (LOTO) — antes de cualquier intervención</h4><div class="step-card"><div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Parar y desconectar</span></div><div class="step-card__row"><span>Acción</span><span>Parar la máquina según el manual y desconectar el interruptor principal.</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Asegurar contra reconexión</span></div><div class="step-card__row"><span>Acción</span><span>Cerrar los dispositivos de mando principales, <strong>retirar la llave</strong> y colocar un rótulo de advertencia en el interruptor principal.</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">Verificar ausencia de tensión</span></div><div class="step-card__row"><span>Acción</span><span>Con un equipo de comprobación adecuado, verificar que no hay tensión. Si hay cable de alimentación, desconectarlo.</span></div><div class="step-card__params">Solo electricistas formados y autorizados pueden hacer trabajos eléctricos.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Liberar presión y proteger la zona</span></div><div class="step-card__row"><span>Acción</span><span>Despresurizar aire comprimido y vacío (la carcasa de filtro solo se abre <strong>sin presión</strong>). Delimitar la zona e informar al personal, nombrando un supervisor.</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Antes de volver a conectar</span></div><div class="step-card__row"><span>Acción</span><span>Eliminada la causa, resetear la anomalía, <strong>verificar los dispositivos de seguridad</strong> y comprobar que la máquina funciona sin colisiones.</span></div></div><h4>Advertencias del manual</h4><table class="crit-table"><tbody><tr><th>Tema</th><th>Advertencia</th></tr><tr><td><strong>Bloqueo doble antes de trabajar en la máquina</strong></td><td>(1) Accionar el pulsador de golpe PARADA DE EMERGENCIA, desconectar el interruptor principal y enclavarlo con candado, y comprobar la ausencia de tensión con un equipo adecuado — ¡tras la desconexión pueden quedar circuitos con tensión, ver esquema eléctrico! (2) Cerrar y bloquear con candado las válvulas de bloqueo de aire comprimido y vacío y suprimir la presión.</td></tr><tr><td><strong>Dejar la máquina sin presión (neumática)</strong></td><td>1) Desconectar la alimentación externa de aire. 2) Cerrar la válvula de bloqueo (el aire se escapa). 3) Abrir y retirar la abrazadera de tubo. 4) Retirar la tubería de la conexión. Los componentes neumáticos bajo presión pueden explotar durante los trabajos.</td></tr><tr><td><strong>Personal autorizado</strong></td><td>Sólo personal formado y autorizado realiza las actividades; los trabajos electrónicos, exclusivamente electricistas especializados instruidos y autorizados. Formación periódica sobre los peligros del manejo y del producto.</td></tr><tr><td><strong>Marcha paso a paso con puertas abiertas (interruptor con llave en 1: MARCHA SERVICIO ESPECIAL)</strong></td><td>ADVERTENCIA: en ese modo están desactivados TODOS los equipos de protección, incluidos los interruptores de seguridad de las puertas. Sólo para personal autorizado. Arrancar únicamente cuando no haya nadie en la zona de peligro y con todas las piezas de formato y componentes montados y ajustados.</td></tr><tr><td><strong>Masas en movimiento y piezas en rotación</strong></td><td>Peligro de atrapamiento: llevar ropa ceñida, recoger el cabello (redecilla), quitarse la bisutería, no subirse a la máquina ni pasar por encima de encarenados abiertos. Durante el desplazamiento de referencia y la marcha síncrona hay movimientos NO perceptibles: mantener distancia suficiente.</td></tr><tr><td><strong>Árbol transportador de producto en rotación</strong></td><td>No introducir las manos en el recipiente de producto ni tocar la conexión de llenado: el árbol transportador puede lastimar manos y brazos.</td></tr><tr><td><strong>Aire de aspiración</strong></td><td>Cerca de las tuberías de aspiración pueden aspirarse partes del cuerpo (por ejemplo los ojos) con lesiones graves. Mantener las partes del cuerpo alejadas; los trabajos en las tuberías sólo con la máquina desconectada.</td></tr><tr><td><strong>Explosión de polvo</strong></td><td>PELIGRO: el polvo inflamable (con azúcar o almidón) se vuelve explosivo con la mezcla de aire adecuada y una fuente de ignición; basta una capa de pocos milímetros levantada y una chispa. Eliminar inmediatamente las acumulaciones, limpiar con regularidad, comprobar periódicamente los aparatos eléctricos, poner a tierra máquina y objetos con carga electrostática. En extinción, el chorro de agua no debe levantar el polvo. Prohibido llenar o procesar productos de relleno explosivos o inflamables.</td></tr><tr><td><strong>Filtros y productos tóxicos</strong></td><td>Los filtros no retienen todas las sustancias peligrosas: deben usarse dentro de su especificación (tasa de separación y tamaño de partícula) y el dueño es responsable de comprobar que sean adecuados a sus productos. El explotador debe proteger a su personal frente al producto, especialmente en limpieza, eliminación de residuos y reparaciones.</td></tr><tr><td><strong>Restos de producto durante el desmontaje</strong></td><td>Pueden quedar restos de producto entre las piezas; la inhalación y el contacto pueden ser perjudiciales. El propietario debe facilitar medidas de protección e informar del potencial de peligro. No devolver piezas sin el consentimiento de Bosch.</td></tr><tr><td><strong>Soltar los frenos de retención</strong></td><td>Al soltarlos puede moverse el accionamiento. Antes: cerrar todas las puertas, no introducir las manos en la máquina ni en el accionamiento y asegurar convenientemente los dispositivos.</td></tr><tr><td><strong>Anillo de apriete/apoyo de ~20 kg</strong></td><td>Montaje y desmontaje por al menos DOS personas y con los segmentos previamente desmontados; en caso contrario puede caerse y causar lesiones graves.</td></tr><tr><td><strong>Mantenimiento remoto (teleservicio)</strong></td><td>¡Peligro de arranque automático de la máquina! Accionar la PARADA DE EMERGENCIA ANTES de activarlo y encenderlo sólo por acuerdo previo con un técnico Bosch. La conexión está separada por un interruptor con llave que NO se debe puentear. Desenclavar la seta sólo tras apagar el teleservicio.</td></tr><tr><td><strong>Uso correcto de la PARADA DE EMERGENCIA</strong></td><td>Activarla sólo en caso de peligro: la máquina se detiene inmediatamente y se pueden producir averías. No sirve para paradas normales (usar PARO). Antes de reconectar, determinar y eliminar la causa.</td></tr><tr><td><strong>Superficies calientes y sellado en caliente</strong></td><td>Dejar enfriar las piezas calefactadas antes de tocarlas. Desconectar las calefacciones en paradas de más de 15 minutos (peligro de incendio).</td></tr><tr><td><strong>Trabajos de soldadura eléctrica</strong></td><td>Desconectar el interruptor principal, limpiar la máquina de polvo y sustancias inflamables, NO conectar el equipo soldador en el armario eléctrico, extraer equipos y tarjetas electrónicas y desembornar codificadores y emisores de impulsos. La masa del equipo se coloca junto al punto de soldadura; la corriente no debe fluir por la puesta a tierra ni por el blindaje. Aplicable también a máquinas unidas mecánicamente a la GKF.</td></tr><tr><td><strong>Trabajos en el armario eléctrico</strong></td><td>PELIGRO de electrocución mortal: sólo especialista electrónico según las reglas electrotécnicas, con el interruptor principal desconectado y asegurado contra reconexión.</td></tr><tr><td><strong>Estado de la máquina antes de conectar</strong></td><td>Poner en funcionamiento sólo con todos los equipos de protección montados y operativos (protecciones desmontables, PARADA DE EMERGENCIA, aislamientos sonoros, aspiradores). Antes de conectar, asegurarse de que nadie pueda ser puesto en peligro por el arranque. No modificar ni transformar los dispositivos de seguridad ni soldar en piezas portantes.</td></tr><tr><td><strong>Portapistones de compresión y líquidos</strong></td><td>Los portapistones neumáticos no se deben desarmar, sumergir en líquido ni limpiar con líquidos fluyentes: se rompe la película lubricante y falla la válvula de retención; además los líquidos retenidos pueden pasar al producto y los resortes no inoxidables oxidarse.</td></tr><tr><td><strong>Integridad de datos (21 CFR parte 11)</strong></td><td>Al borrar un lote se borra también su Audittrail. Debe estar siempre asegurado que el lote original y el Audittrail original están disponibles; sólo se pueden borrar los datos ya almacenados y sólo si el cliente ha determinado que los almacenados son los originales. Las contraseñas de fábrica deben cambiarse obligatoriamente.</td></tr><tr><td><strong>Reconexión tras mantenimiento, avería o cambio de formato</strong></td><td>Verificar los dispositivos de seguridad y comprobar el proceso funcional sin anomalías (servicio libre de colisiones). Las máquinas con equipos de protección separadores dependientes del formato deben adaptarse al nuevo formato antes de reconectar.</td></tr></tbody></table>
              `
            },
            {
              id: "gkf-pendientes",
              title: "Datos por confirmar",
              content: `
<p>Lo que la documentación <strong>no</strong> especifica y hay que validar en planta o pedir a Bosch:</p><ul><li>Tensión, frecuencia, potencia instalada y corriente nominal de la máquina: NO figuran en el texto del manual ni del catálogo. Tomar de la placa de características y del esquema eléctrico del armario y registrarlas en la ficha del equipo.</li><li>Peso de la máquina y cotas de emplazamiento: las páginas de dibujo (AZ_8104324207_b01/b02 y TZ_8104324117) aparecen en blanco en la extracción de texto. Consultar el PDF original o la tarjeta USB antes de cualquier movimiento o izaje.</li><li>Valor de vacío de trabajo del sistema (nivel de la bomba) y caudal de la instalación de aspiración: sólo se da el ajuste de la estación de separación (−0,1 a −0,4 bar). Medir y registrar el valor real de planta y el caudal mínimo exigido al aspirador.</li><li>Equipamiento realmente instalado: en la lista de equipamiento del manual (págs. 15-17) las casillas marcadas no se pueden distinguir en el texto extraído. Verificar físicamente qué opciones tiene esta máquina (ASB, Audittrail, KKE, semáforo, mando bimanual, IPK/balanza, NWDS, disco dosificador eléctrico, transportador de cápsulas, limpieza reforzada, estaciones 4/6/8).</li><li>Tabla de ajuste de pasadores de separación (pág. 394): la asignación exacta de cada tamaño de cápsula a su columna de cabezal digital/cota A/cota B se perdió en la extracción. Verificar contra el PDF original antes de usarla.</li><li>Tablas de altura de discos dosificadores por volumen (págs. 446-448): los pares volumen–altura por tamaño de cápsula deben leerse directamente del manual original; no se transcribieron para no inducir a error.</li><li>Tabla de disposición de los anillos de formato del estribo de expulsión (págs. 451 y 459): aparece corrupta en la extracción. Consultar el manual original.</li><li>Escalonamiento recomendado de resortes de los pistones de compresión por producto (pág. 78 del cap. 7): referenciado pero no detallado. Definir en planta por ensayo y dejarlo registrado en la lista de ajustes de cada producto.</li><li>Pares de apriete: sólo constan 40 Nm y 9 Nm del accionamiento de la estación dosificadora. Para el resto de tornillería no hay valores en la documentación; definir criterio interno o consultar a Bosch.</li><li>Frecuencia real de limpieza/cambio del elemento filtrante de vacío: el manual la deja explícitamente a criterio del explotador según el producto. Fijar el intervalo por producto y documentarlo.</li><li>Referencias Bosch de las piezas del PM Kit 3 (pin de detección), 6 (rechazo) y 7 (compuertas deslizantes): el catálogo de PM Kits sólo muestra el despiece sin listado de texto. Pedir el desglose a Bosch.</li><li>Discrepancia de referencia del PC industrial: 8-108-178-783 en el plan de mantenimiento y 8-108-178-451 en el capítulo 10 (ambos VPB40.3). Y dos referencias de panel de mando: R-911-173-921 (Bosch Rexroth VDP40.3) y 8-109-537-166 (Beckhoff CP3921). Confirmar cuál está montado antes de pedir.</li><li>Dos referencias distintas para el casquillo de bolas 20/28X30 según el grupo: 8-108-136-624 (expulsión de defectuosas) y 8-108-127-927 (limpieza de segmentos). Verificar el grupo antes de pedir.</li><li>Componentes electrónicos del armario eléctrico y de las cajas de bornes: NO están en el catálogo de repuestos; se encuentran en la documentación electrónica adicional. Solicitarla y archivarla.</li><li>Lista completa de derechos de usuario del HMI: remitida al capítulo 9; conviene extraerla y definir la matriz de permisos por rol de planta.</li><li>Contraseñas de fábrica (operator 0001, setup 2003, supervisor 0007, admin 2468): el manual obliga a cambiarlas. Confirmar que ya se cambiaron y custodiar la hoja fuera del manual.</li><li>Documentación OEM (bomba de vacío, aspiradora Krahnen, servocontrol, refrigeración +S200, mecanismo paso a paso Heinz, motor Lenze): sólo en PDF en la tarjeta USB, no impresa. Verificar que la tarjeta está disponible y respaldada.</li><li>Intervalos legales de comprobación de la instalación aplicables en Colombia y certificados de comprobación asociados: el manual remite a la normativa local. Definir con SST/HSE.</li><li>Datos de ensayo de la línea (ATEX / clasificación de zona por polvo del producto procesado) y adecuación de los filtros del explotador a ese producto: responsabilidad expresa del dueño, no cubierta por la documentación.</li><li>Horas de servicio actuales de la máquina para posicionar los PM Kits (4000/6000 h) y los intervalos de 2000/5000/10000/30000 h: consultar el contador de horas de servicio del HMI y construir el calendario real de mantenimiento.</li></ul><div class="alert-box">La documentación de esta máquina es muy completa (594 págs. de manual + 196 de repuestos). Estos puntos son los pocos que quedan abiertos.</div>
              `
            }
          ],
          systems: [
            { name: "Alimentación y orientación (Est. 1-2)", function: "Clasificar, orientar e introducir cápsulas en segmentos y abrirlas por vacío.", components: ["Depósito y almacenes", "Bloque clasificador + correderas KWSE20/TKSD", "Zapatas de aspiración + pasadores separación", "Sensor ultrasónico"], status: "Manual pág. 393-396" },
            { name: "Exploración y control (Est. 3)", function: "Detectar tapa/cuerpo en cada taladro; opción IPK/balanza.", components: ["Pasadores exploración", "Sensores IQ08-02BPSKT0 / IFS 5036"], status: "Manual pág. 340-352" },
            { name: "Dosificación principal (Est. 5)", function: "Compactar polvo en 5 puntos o dosificar pellets/pastillas.", components: ["Depósito producto 1", "Disco dosificador ajustable/fijo", "Anillo producto + pistones 8-104-233-801", "Válvula ED02 proporcional"], status: "Manual pág. 417-438" },
            { name: "Llenado pellets/pastillas (Est. 4,6,8)", function: "Estaciones opcionales para pellets y pastillas.", components: ["Depósitos 2-3", "Discos dosificadores, vibrador, pastillas"], status: "Manual pág. 491-493" },
            { name: "Rechazo y cierre (Est. 7 y 9)", function: "Rechazar no conformes y cerrar cápsulas con control de fuerza.", components: ["Estación 7 vacío + aspiración", "Estación 9 con sensor parte inferior + contrasoporte"], status: "Manual pág. 497-499" },
            { name: "Expulsión y limpieza (Est. 10-12)", function: "Expulsar conformes y limpiar segmentos con aire aspirado.", components: ["Estaciones 10-11 expulsión", "Estación 12 limpieza + aspiradora Krahnen"], status: "Manual pág. 550-567" },
            { name: "Control y neumática", function: "HMI Schneider PacDrive, seguridad PLUTO B46, neumática y aspiración.", components: ["Controller Elau LMC400 + VPB40.3", "PLUTO B46, cilindros D12-H5, filtros AFR"], status: "Manual pág. 301-328" }
          ],
          systemAtlas: {
            title: "Vista general + desglose por estaciones (GKF 2600)",
            description: "Lectura guiada como NJP: 12 estaciones en 2 líneas. Toca un sistema para ver su figura, componentes, ajustes y diagnóstico. El despiece interactivo (MACHINE_PARTS) y las 81 calibraciones están en Despiece.",
            machineMap: {
              title: "GKF 2600 — 12 estaciones (2×9)",
              description: "Mapa tocable: de alimentación (1-2) a limpieza (12).",
              image: { src: "assets/gkf2600/vista-general.jpg", alt: "GKF 2600 vista general", page: 15 },
              hotspots: [
                { label: "1-2 Alimentación", target: "alimentacion", x: 20, y: 12, w: 4, h: 6 },
                { label: "3 Exploración", target: "exploracion", x: 32, y: 28, w: 4, h: 6 },
                { label: "5 Dosificación", target: "dosificacion", x: 45, y: 42, w: 4, h: 6 },
                { label: "7 Rechazo", target: "rechazo", x: 56, y: 48, w: 4, h: 6 },
                { label: "9 Cierre", target: "cierre", x: 64, y: 55, w: 4, h: 6 },
                { label: "10-11 Expulsión", target: "expulsion", x: 72, y: 65, w: 4, h: 6 },
                { label: "12 Limpieza", target: "limpieza", x: 78, y: 78, w: 4, h: 6 }
              ]
            },
            systems: [
              { id: "alimentacion", name: "Alimentación y separación (Est.1-2)", kicker: "S1-S2", station: "Est.1-2", page: 393, status: "Manual pág.393-396", figure: { src: "assets/gkf2600/despiece/p061.jpg", alt: "Alimentación GKF", title: "Estación de clasificación con estación de separación", page: 61, caption: "Catálogo de repuestos p.61 — grupo 1.1.1.14, las dos líneas de clasificación y separación." }, summary: "Orienta cápsulas tapa arriba y las abre por vacío. La concentricidad de segmentos y el vacío (−0,1 a −0,4 bar) son críticos.", flow: ["Depósito → almacenes → clasificador", "Zapata vacío abre cápsula (cuerpo abajo)", "Pasadores separación elevan 1-2 mm"], components: ["KWSE20/TKSD riel", "Zapatas + resortes", "Pasadores 1-2 mm"], adjustments: ["Elevación pasadores 1-2 mm (cota A/B 26/19 mm)", "Vacío −0,1→−0,4 bar"], diagnostics: ["No abre → vacío/filtro o pasadores mal ajustados"] },
              { id: "exploracion", name: "Exploración / control en proceso (Est.3-4)", kicker: "S3-S4", station: "Est.3", page: 340, status: "Manual pág.340", figure: { src: "assets/gkf2600/despiece/p143.jpg", alt: "Exploración", title: "Exploración de la parte superior", page: 143, caption: "Catálogo de repuestos p.143 — grupo 1.2.8, la exploración que comprueba tapa y cuerpo." }, summary: "Palpa tapa/cuerpo en cada taladro; opcional IPK/balanza.", flow: ["Palpador detecta presencia", "Contador suma fallos por taladro", "Alarma 731-748 si obstrucción"], components: ["Palpadores + casquillos", "Sensores IQ08"], adjustments: ["Limpieza palpadores (cepillo)", "Calibración sensor"], diagnostics: ["Fallo suma → banda depósito obstruida p.340"] },
              { id: "dosificacion", name: "Dosificación (Est.5 principal)", kicker: "S5", station: "Est.5", page: 417, status: "Manual pág.417", figure: { src: "assets/gkf2600/despiece/p079.jpg", alt: "Dosificación", title: "Estación de dosificación de polvo", page: 79, caption: "Catálogo de repuestos p.79 — grupo 1.1.1.18, disco dosificador y pistones de compresión." }, summary: "Dosifica con disco y 5 puntos de compresión. La distancia disco-anillo y la presión 3 bar definen el peso.", flow: ["Polvo → sinfín → disco (0,127-0,902 ml)", "5 campanas ×18 pistones compactan", "Niveles anillo producto"], components: ["Disco ajustable/fijo", "Pistones 8-104-233-801", "ED02 proporcional"], adjustments: ["Altura disco 3-14 mm / 14-27 mm", "Presión 3 bar ±", "Resortes a/b/c/d/e decreciente"], diagnostics: ["Peso variable → presión o resortes"] },
              { id: "rechazo", name: "Rechazo (Est.7)", kicker: "S7", station: "Est.7", page: 461, status: "Manual pág.461", figure: { src: "assets/gkf2600/despiece/p103.jpg", alt: "Rechazo", title: "Expulsión de cápsulas defectuosas", page: 103, caption: "Catálogo de repuestos p.103 — grupo 1.1.1.27, la expulsión de la estación 7." }, summary: "Expulsa cápsulas no separadas o mal colocadas por vacío.", flow: ["Sensor detecta no conforme", "Vacío aspira al descarte", "Ajuste corredera + estrella"], components: ["Boquilla aspiración", "Estribo expulsión"], adjustments: ["Corredera + estrella hasta aspirar solo no conformes"], diagnostics: ["Aspira buenas → ajustar boquilla"] },
              { id: "cierre", name: "Cierre (Est.9)", kicker: "S9", station: "Est.9", page: 497, status: "Manual pág.497", figure: { src: "assets/gkf2600/despiece/p107.jpg", alt: "Cierre", title: "Estación de cierre", page: 107, caption: "Catálogo de repuestos p.107 — grupo 1.1.1.29, el cierre de la cápsula." }, summary: "Encaja cuerpo en tapa con control de fuerza y contrasoporte.", flow: ["Pasador cierre inserta cuerpo", "Contrasoporte verifica altura", "Saliente 1,0-1,5 mm"], components: ["Pasadores cierre", "Contrasoporte + sensor"], adjustments: ["Saliente 1,0-1,5 mm, distancia mín 0,5 mm", "Pasador mayor Ø si comprimido duro"], diagnostics: ["Telescópica/ranurada → exceso llenado o Ø pequeño"] },
              { id: "expulsion", name: "Expulsión (Est.10-11)", kicker: "S10-11", station: "Est.10", page: 550, status: "Manual pág.550", figure: { src: "assets/gkf2600/despiece/p113.jpg", alt: "Expulsión", title: "Expulsión de cápsulas conformes", page: 113, caption: "Catálogo de repuestos p.113 — grupo 1.1.1.32, la salida del producto terminado." }, summary: "Expulsa conformes a la canaleta. Doble línea.", flow: ["Pasador expulsión empuja cápsula", "Canaleta recoge", "Sensor atasco vigila"], components: ["Pasadores expulsión", "Canaleta + sensor"], adjustments: ["Limpieza pasadores (polvo pegajoso)", "Sensor atasco"], diagnostics: ["No expulsa → cilindro/sensor/cable"] },
              { id: "limpieza", name: "Limpieza (Est.12)", kicker: "S12", station: "Est.12", page: 550, status: "Manual pág.550", figure: { src: "assets/gkf2600/despiece/p119.jpg", alt: "Limpieza", title: "Estación de limpieza de segmentos", page: 119, caption: "Catálogo de repuestos p.119 — grupo 1.1.1.35, la limpieza por aire y toberas." }, summary: "Limpia segmentos con aire aspirado para siguiente ciclo.", flow: ["Toberas soplan", "Aspiradora Krahnen aspira", "Filtro 8-108-179-327"], components: ["Toberas", "Conductos aspirado", "Filtro HEPA"], adjustments: ["Vacío/asp. sin desmontar"], diagnostics: ["Polvo residual → filtro saturado"] }
            ]
          },
          spareParts: [
            { name: "Disco dosificador ajustable (pieza de formato)", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-322-400 (t0) · 8-104-322-401 (t1) · 8-104-322-402 (t2) · 8-104-322-403 (t3)", function: "Define el volumen de dosificación; altura ajustable mecánica o eléctricamente" },
            { name: "Anillo en O del disco dosificador ajustable 355X4", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-108-140-300", function: "Sella el disco dosificador (mismo para tamaños 0, 1, 2 y 3)" },
            { name: "Punzón de ajuste del disco dosificador (2 uds)", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-233-813 (t0) · -814 (t1) · -815 (t2) · -816 (t3)", function: "Reglaje del disco dosificador por tamaño de cápsula" },
            { name: "Pistón de compresión (juego de 108 uds)", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-233-801 (fijo t1 / ajustable t0) · 8-104-233-807 (t1) · 8-104-233-808 (t2) · 8-104-233-809 (t3)", function: "Compacta el polvo en los taladros del disco; identificados con S (disco fijo) o V (disco ajustable) + formato" },
            { name: "Pistón de compresión del deflector (18 uds) e inserto", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "Pistones 8-104-233-865/861/862/863 (t0/t1/t2/t3) · Insertos 8-104-236-680/681/682/683", function: "Piezas de formato del deflector" },
            { name: "Perno de presión del pistón de compresión", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-237-970", function: "Transmite la fuerza del resorte al pistón (18 por campana)" },
            { name: "Muelle de compresión 2/10X39 del pistón", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-108-138-607", function: "Muelle de cada pistón de compresión (18 por campana). Resortes 1–4 con fuerza 5/64/105/200 N y elevación útil máx. 9/6/4/3 mm" },
            { name: "Anillo turcon 12X7,1X2,2 + anillo en O 6,07X1,78", system: "Estación dosificadora (regulación neumática)", type: "Repuesto", criticality: "Media", reference: "8-108-136-642 · 8-106-001-242", function: "Sello dinámico de cada pistón en la campana de suspensión neumática (18+18)" },
            { name: "Campana de alojamiento de pistones de compresión / peine / portapunzón", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-233-607 · 8-104-233-609 · 8-104-233-608", function: "Alojan y guían los 18 pistones de compresión" },
            { name: "Anillo de guía de pistón de compresión", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-308-421 · versión con bujes de plástico 90318104236308", function: "Guía los pistones; los casquillos se comprueban con probeta y se sustituyen si están usados" },
            { name: "Filtro de vacío G2½' y cartucho Micro-Top C 15-124/1", system: "Vacío", type: "Repuesto", criticality: "Media", reference: "8-108-136-294 · 8-108-643-460", function: "Filtra el aire aspirado del circuito de vacío" },
            { name: "Cartucho filtrante de malla fina 0,1 µm C 15-154/1 y módulo HEPA 14 EIT-130-8474", system: "Vacío / separación", type: "Repuesto", criticality: "Media", reference: "8-108-145-572 · 8-108-179-327", function: "Filtración fina del aire de la estación de separación (PM Kit 2)" },
            { name: "Bomba de vacío ELMO-G 2BH7420-0AH26-7 y sus retenes", system: "Vacío", type: "Repuesto", criticality: "Alta", reference: "8-108-169-805 · retenes 8-108-180-518 (30/47X7) y 8-108-180-519 (35/47X7)", function: "Genera el vacío de separación de cápsulas" },
            { name: "Interruptor de presión de vacío 33D y válvula reguladora", system: "Vacío", type: "Repuesto", criticality: "Alta", reference: "8-108-171-948 · 8-108-102-958", function: "Ajuste y vigilancia del vacío (fallo 275)" },
            { name: "Correa dentada del accionamiento principal 1200-8M-30 (Z=150)", system: "Accionamiento principal", type: "Repuesto", criticality: "Media", reference: "8-108-136-292", function: "Transmisión del árbol principal — tensar a 154 Hz ±5 Hz" },
            { name: "Correa dentada CXP 8M-960-50 HTD", system: "Accionamientos", type: "Repuesto", criticality: "Media", reference: "8-108-148-303", function: "Reductor planetario → árbol principal y accionamiento de la estación dosificadora" },
            { name: "Correa dentada 1280-8M-50 (Z=160) y 684-3M-9 (Z=228)", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-108-136-291 · 8-108-137-973", function: "Accionamiento de la estación de dosificación de polvo" },
            { name: "Servomotor AC SH140/30200 con reductor PLN115-12", system: "Accionamiento principal", type: "Repuesto", criticality: "Alta", reference: "8-109-521-634 · 8-108-148-013", function: "Accionamiento principal de la máquina" },
            { name: "Servomotor AC SH140/30120 y unidad de control (servoamplificador)", system: "Estación dosificadora", type: "Repuesto", criticality: "Alta", reference: "8-108-175-006 · 8-108-178-457 (LXM62DD45C21000)", function: "Accionamiento desconectable de la estación dosificadora" },
            { name: "Codificador angular AFS60A-S4EB262144 y AFM60A-S4EB018X12", system: "Accionamientos", type: "Repuesto", criticality: "Alta", reference: "8-108-177-348 · 8-108-178-437", function: "Posición del árbol principal / realimentación de la regulación del disco dosificador (fallos 57, 95, 96, 97)" },
            { name: "Mecanismo paso a paso de dosificación HTSG 133-6-H150", system: "Estación dosificadora", type: "Repuesto", criticality: "Alta", reference: "8-104-242-001", function: "Indexado de la estación dosificadora; revisión a 5000 h y recambio de obturaciones/rodamientos a 30000 h" },
            { name: "Mecanismo paso a paso del desplazamiento circular de segmentos", system: "Transporte de segmentos", type: "Repuesto", criticality: "Alta", reference: "8-104-234-308", function: "Indexa el giro del portasegmentos" },
            { name: "Acoplamiento de sobrecarga del engranaje de polvo", system: "Estación dosificadora", type: "Repuesto", criticality: "Alta", reference: "8-104-235-143", function: "Protege la estación dosificadora ante bloqueo (fallo 290), vigilado por detector IEK3002 8-108-166-023" },
            { name: "Motor de engranajes cónicos GKR04-2M-HAK-071C32", system: "Alimentación de producto", type: "Repuesto", criticality: "Alta", reference: "8-108-170-987", function: "Acciona el árbol transportador de polvo; cambio de lubricante y retenes a 10000 h" },
            { name: "Casquillo de bolas 12/19X28 (48 uds) y anillo rascador 12/19X6,7/10,7 (24 uds)", system: "Transporte de segmentos", type: "Repuesto", criticality: "Media", reference: "8-108-136-623 · 8-104-234-316", function: "Guía lineal de los segmentos portacápsulas" },
            { name: "Casquillo de bolas 20/28X30 y anillo rascador 20/28X9", system: "Varias estaciones", type: "Repuesto", criticality: "Media", reference: "8-108-136-624 / 8-108-127-927 · 8-104-234-336", function: "Guías de segmentos, expulsión de defectuosas, bloques de separación y limpieza de segmentos (28 y 15 uds en total)" },
            { name: "Casquillo de bolas 6/12X19 (36 uds) + rascador 6/14X4/6 (18) + casquillo XFM-0405-06 (18)", system: "Expulsión", type: "Repuesto", criticality: "Media", reference: "8-108-100-311 · 8-104-236-330 · 8-101-210-194", function: "Guía de los 18 árboles de la expulsión de cápsulas conformes" },
            { name: "Casquillo de bolas 25/35X40 + rascador 25/35X11", system: "Cierre / clasificación", type: "Repuesto", criticality: "Media", reference: "8-108-136-625 · 8-104-234-110", function: "Guía de la placa de cierre y del soporte de bloque de clasificación" },
            { name: "Casquillo de bolas 60/90X125 (4 uds) y anillo rascador 60/70X10/13,8", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-108-101-454 · 8-104-233-670", function: "Guía de columna de la estación de dosificación" },
            { name: "Casquillo de bolas 40/52X60 + rascador 40/55X10/13", system: "Exploración de cápsula", type: "Repuesto", criticality: "Media", reference: "8-105-056-194 · 8-104-233-316", function: "Guía de la exploración de la parte superior" },
            { name: "Rascador 10/17X3 (12 uds) y casquillo de bolas 10/17X26 (24 uds)", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-242-289 · 8-101-203-605", function: "Guías de la brida con corredera de la estación dosificadora" },
            { name: "Muelle de hojas para bloqueo de cápsulas (18 uds)", system: "Clasificación", type: "Repuesto", criticality: "Media", reference: "8-104-227-819", function: "Retiene la cápsula en cada cavidad durante la clasificación (común a todos los formatos)" },
            { name: "Pasador clasificador (2 uds, pieza de formato)", system: "Clasificación", type: "Repuesto", criticality: "Media", reference: "8-104-237-234 (t0) · -235 (t1) · -236 (t2) · -237 (t3)", function: "Única pieza que cambia con el tamaño dentro del formato de clasificación" },
            { name: "Perno enchufable del formato de segmento (2 uds)", system: "Segmentos", type: "Repuesto", criticality: "Media", reference: "8-108-219-740 (t0) · -750 (t1) · -760 (t2) · -770 (t3)", function: "Fija y posiciona el formato de segmento" },
            { name: "Guía de cápsulas de la expulsión de conformes", system: "Expulsión", type: "Repuesto", criticality: "Media", reference: "8-104-236-530 (t0) · -531 (t1) · -532 (t2) · -533 (t3)", function: "Encauza la cápsula terminada por tamaño" },
            { name: "Corredera (chapa de empujador) formato 1 (6 uds)", system: "Estación dosificadora", type: "Repuesto", criticality: "Media", reference: "8-104-307-911", function: "Chapas de empujador del tamaño de cápsula 1" },
            { name: "Anillo distanciador del inserto de tolva de pellets (4 uds)", system: "Estación de llenado de pellets", type: "Repuesto", criticality: "Media", reference: "8-104-238-690 (H2,03) · -691 (H2,1) · -692 (H2,2) · -693 (H2,3) · -694 (H2,4) · -695 (H2,5)", function: "Fija la ranura inserto–corredera (0,03 a 0,5 mm) según el Ø del pellet" },
            { name: "Empujador de cierre (18 uds) y portaempujadores", system: "Estación de cierre", type: "Repuesto", criticality: "Media", reference: "8-104-227-073 · 8-104-234-133", function: "Cierran la cápsula empujando el cuerpo dentro de la tapa" },
            { name: "Punzón de limpieza Ø4 mm", system: "Estación de limpieza", type: "Repuesto", criticality: "Media", reference: "8-104-237-405 (L=71, 9 uds) · 8-104-237-406 (L=78, 9 uds)", function: "Limpian los taladros de los segmentos" },
            { name: "Estribo de expulsión de cápsula no conforme y anillos de formato", system: "Estación de cápsulas defectuosas", type: "Repuesto", criticality: "Media", reference: "8-104-308-177 (estación 7)", function: "Sube la cápsula defectuosa para que la aspiración la retire" },
            { name: "Sensor inductivo IFS 5036 (18 uds) + cable AL-SKP3-10/P00", system: "Estación de cierre", type: "Repuesto", criticality: "Alta", reference: "8-108-167-613 · 8-108-180-642", function: "Exploración de cierre, una por cavidad" },
            { name: "Sensor inductivo IQ08-02BPSKT0 (18 uds)", system: "Exploración de cápsula", type: "Repuesto", criticality: "Alta", reference: "8-108-177-881", function: "Exploración de la parte superior de la cápsula" },
            { name: "Sensor inductivo IEB3004-BPKG (18 uds) e imanes 6X11,5/M3 (18)", system: "Expulsión", type: "Repuesto", criticality: "Alta", reference: "8-109-516-270 · 8-108-146-562", function: "Confirmación de la expulsión de cápsula única" },
            { name: "Sensor de polvo capacitivo KAS-80-23-170-A-PEEK/VA-Y5", system: "Estación dosificadora", type: "Repuesto", criticality: "Alta", reference: "8-108-149-144", function: "Nivel de polvo sobre el disco dosificador (fallos 288, 291, 294)" },
            { name: "Sensor ultrasónico de la estación de clasificación", system: "Clasificación", type: "Repuesto", criticality: "Alta", reference: "8-104-233-099", function: "Vigilancia de la clasificación de cápsulas" },
            { name: "Presostato diferencial LGW 10A2", system: "Estación de cierre", type: "Repuesto", criticality: "Media", reference: "8-108-168-189", function: "Vigila la aspiración de la estación de cierre" },
            { name: "Isla de válvulas AV03 EtherCAT (11 y 20 vías)", system: "Neumática", type: "Repuesto", criticality: "Alta", reference: "R-480-722-530 (11) · R-480-722-515 (20)", function: "Mando neumático de la ASB y de los 18 expulsores individuales" },
            { name: "Cilindro neumático de carrera corta D12-H5 doble efecto", system: "Clasificación", type: "Repuesto", criticality: "Media", reference: "0-822-010-600", function: "Habilitación de cápsulas en el almacén (ASB)" },
            { name: "Válvula reguladora de presión proporcional ED02", system: "Estación dosificadora", type: "Repuesto", criticality: "Alta", reference: "R-414-002-411", function: "Regula la presión de la suspensión neumática de los pistones de compresión (fallo 99)" },
            { name: "Filtro-regulador G1/2 con manómetro 0–16 bar y válvula 3/2 G1/2", system: "Neumática", type: "Repuesto", criticality: "Alta", reference: "R-412-007-197 · R-412-007-872 · R-412-007-269 · válvula de cierre R-412-007-261", function: "Unidad de mantenimiento de aire comprimido (fallo 274)" },
            { name: "Interruptor de presión de aire comprimido PE5-A1", system: "Neumática", type: "Repuesto", criticality: "Alta", reference: "R-412-010-773", function: "Vigilancia eléctrica de la presión de aire" },
            { name: "Válvula de seguridad 0,5 bar DN8-G3/8 y reguladora NL2 con manómetro 0–4 bar", system: "Transportador de cápsulas vacías", type: "Repuesto", criticality: "Alta", reference: "8-108-146-467 · 0-821-302-515 · R-412-007-869", function: "Protección y regulación del transporte neumático de cápsulas vacías" },
            { name: "Manguera AIRDUC PUR 351 EL 70x4,5 y abrazaderas con toma de tierra", system: "Aspiración", type: "Repuesto", criticality: "Media", reference: "8-108-148-977 · 8-108-175-841 · conjunto D70 5 m 8-104-231-063 (2 uds)", function: "Aspiración antiestática de polvo" },
            { name: "Aspiradora Krahnen ES VA 2/820 (230 V, 60 Hz) y su filtro principal", system: "Aspiración", type: "Repuesto", criticality: "Media", reference: "8-180-002-365", function: "Aspiración de polvo y limpieza" },
            { name: "Interruptor de seguridad TV10S 335-02z + adaptador Tina 3A + sensores Adam/Eva", system: "Seguridad", type: "Repuesto", criticality: "Alta", reference: "8-108-167-256 · 8-108-174-328 · 8-108-180-219 · 8-108-179-810", function: "Vigilancia de las puertas de protección (fallos 358, 368, 389–395)" },
            { name: "PLC de seguridad PLUTO B46 V2", system: "Seguridad", type: "Repuesto", criticality: "Alta", reference: "8-108-177-685", function: "Circuito de seguridad de puertas y paradas de emergencia" },
            { name: "Muelle de gas 1150 N de las puertas de protección (8 uds)", system: "Cabina", type: "Repuesto", criticality: "Media", reference: "8-108-115-655", function: "Sostiene las puertas de la cabina" },
            { name: "Ventilador con filtro Rittal SK 3241.124 y equipo de refrigeración +S200 SK 3201.300", system: "Armario eléctrico", type: "Repuesto", criticality: "Media", reference: "8-109-519-559 · 8-113-065-164", function: "Climatización del armario eléctrico (fallos 262 y 891); máx. 45 °C" },
            { name: "Controller Elau LMC400CAA10000, PC industrial VPB40.3 y módulo SAI VAU01.1U", system: "Control", type: "Repuesto", criticality: "Alta", reference: "8-108-177-679 · 8-108-178-783 (también citado 8-108-178-451) · R-911-171-024", function: "Control y HMI; batería, pila CMOS y acumulador a cambiar cada 10000 h" },
            { name: "Memoria extraíble USB de recuperación de software", system: "Control", type: "Repuesto", criticality: "Alta", reference: "Identificada con el n.º de máquina y la versión de software", function: "Reinstala el programa de mando (restablece el estado de entrega y borra todos los datos)" }
          ],
          maintenanceTasks: [
            { name: "Limpiar toda la máquina, el recinto de producción y todas las partes en contacto con el producto; retirar restos de producto y cápsulas", system: "Máquina completa", frequency: "Diario", type: "Preventivo", acceptance: "Sólo aire de ASPIRACIÓN, nunca aire de soplado (introduce partículas en cojinetes y componentes eléctricos). Sin capas de polvo acumulado (riesgo de explosión)" },
            { name: "Limpiar las puertas de protección", system: "Cabina / seguridad", frequency: "Diario", type: "Preventivo", acceptance: "Sólo detergentes y conservantes antiestáticos para plásticos (Burnus). ¡Nunca alcohol ni agentes agresivos: dañan el vidrio acrílico!" },
            { name: "Purgar el agua de la carcasa de filtro de la unidad de mantenimiento", system: "Aire comprimido", frequency: "Diario", type: "Preventivo", acceptance: "Abrir la válvula sólo con la máquina sin presión y purgada" },
            { name: "Limpiar o cambiar el elemento filtrante de la instalación de vacío", system: "Vacío", frequency: "Diario", type: "Preventivo", acceptance: "Soplar de dentro hacia fuera. El intervalo lo define el explotador según el producto; con producto fino y no comprimible, más a menudo o cambiar" },
            { name: "Comprobar y limpiar las zapatas de aspiración (taladros y superficie de obturación) y sus resortes", system: "Estación de separación", frequency: "Diario", type: "Preventivo", acceptance: "Superficie de obturación plana y sin daños; sustituir zapatas deformadas y resortes dañados" },
            { name: "Comprobar la suciedad del filtro de la aspiradora (manómetro) y vaciar el depósito de suciedades", system: "Aspiración de polvo", frequency: "Diario", type: "Preventivo", acceptance: "—" },
            { name: "Limpiar los sensores con paño suave sin hilachas", system: "Sensórica", frequency: "Semanal", type: "Preventivo", acceptance: "—" },
            { name: "Limpiar la pantalla del panel de mando con la función 'Limpiar la pantalla'", system: "HMI", frequency: "Semanal", type: "Preventivo", acceptance: "Paño antiestático blando o limpiacristales con alcohol; nunca disolventes, abrasivos, objetos afilados ni alta presión. El táctil se desactiva ≈30 s" },
            { name: "Limpiar la carcasa de filtro y el cartucho filtrante de la unidad de mantenimiento", system: "Aire comprimido", frequency: "Semanal", type: "Preventivo", acceptance: "Sólo agua (y agente suave); jamás disolventes. Montar la carcasa girada 45° hasta que el desbloqueo engatille de forma audible" },
            { name: "Limpiar y engrasar con capa fina los árboles de guía de: concentricidad de segmento, estación de clasificación, estación de separación, exploración de la parte superior, estación dosificadora, estación de cápsulas defectuosas, estación de cierre y estación de limpieza", system: "Todas las estaciones", frequency: "Semanal", type: "Preventivo", acceptance: "Eliminar la grasa usada; aplicar Cassida Grease EPS 1" },
            { name: "Comprobar el asiento firme de todas las piezas de fijación y apriete", system: "Máquina completa", frequency: "Mensual", type: "Preventivo", acceptance: "Cambiar los tornillos autofijadores que se hayan aflojado" },
            { name: "Comprobar juntas y cojinetes respecto a daños", system: "Máquina completa", frequency: "Mensual", type: "Preventivo", acceptance: "Cambiar inmediatamente los que muestren daño" },
            { name: "Comprobar las juntas de las abrazaderas de tubo (Tri-Clamp)", system: "Tuberías", frequency: "Mensual", type: "Preventivo", acceptance: "Cambiar ante cualquier daño; cuidar la posición concéntrica de junta y tubuladuras" },
            { name: "Limpiar el interruptor de presión del vacío (soplar orificios y tubería de depresión)", system: "Vacío", frequency: "Mensual", type: "Preventivo", acceptance: "Con producto fino y no comprimible, más a menudo" },
            { name: "Limpiar y engrasar las superficies de rodadura de todas las poleas", system: "Transmisiones", frequency: "Mensual", type: "Preventivo", acceptance: "Capa fina de STABYL 300 AL 2" },
            { name: "Comprobar daños y tensión de las correas dentadas (accionamiento principal, desplazamiento de segmentos y estación dosificadora)", system: "Transmisiones", frequency: "Mensual", type: "Preventivo", acceptance: "154 Hz ±5 Hz (principal y dosificadora con tornillo tensor); 90 Hz ±5 Hz (segmentos y dosificadora con rueda tensora). ¡No tensar demasiado! Sustituir de inmediato las correas dañadas" },
            { name: "Engrasar la guía de la corredera de clasificación por su boquilla y engrasar la superficie de rodadura del cojinete", system: "Estación de clasificación", frequency: "Mensual", type: "Preventivo", acceptance: "1–2 emboladas de Cassida Grease EPS 1 en la boquilla; capa fina de STABYL 300 AL 2 en la superficie de rodadura; retirar la grasa sobrante y no apretar la junta de la caperuza" },
            { name: "Limpiar y lubricar la pista de levas y el rodillo de leva de la estación de llenado de pellets", system: "Estación de llenado de pellets", frequency: "Mensual", type: "Preventivo", acceptance: "STABYL 300 AL 2; desmontar la parte superior del accionamiento (5 tornillos)" },
            { name: "Lubricar la leva de corredera y los árboles de guía de la estación de llenado (bajo el anillo de protección, 3 tornillos)", system: "Estación dosificadora", frequency: "Mensual", type: "Preventivo", acceptance: "Árboles de guía con Cassida Grease EPS 1; taladros llenos de STABYL 300 AL 2" },
            { name: "Comprobar con la probeta los casquillos de guía del anillo de guiado de pistón de compresión", system: "Estación dosificadora", frequency: "Mensual", type: "Preventivo", acceptance: "Si la probeta NO entra, el casquillo está bien; si SÍ entra, está usado y hay que reemplazarlo. Casquillos y juego de herramientas se compran a Bosch con instrucciones de montaje" },
            { name: "Limpiar y lubricar las superficies de rodadura de la protección contra torsión de la estación de cápsulas defectuosas y de la estación de cierre", system: "Estaciones 7 y 9", frequency: "Mensual", type: "Preventivo", acceptance: "Capa fina de STABYL 300 AL 2" },
            { name: "Comprobar tubos flexibles, filtro principal e incrustaciones de la aspiradora; control visual de cables", system: "Aspiración de polvo", frequency: "Mensual", type: "Preventivo", acceptance: "Reemplazar el filtro deteriorado" },
            { name: "Comprobar todos los dispositivos eléctricos respecto a daños", system: "Instalación eléctrica", frequency: "Trimestral", type: "Preventivo", acceptance: "Desconectar y asegurar el interruptor principal contra la reconexión. Un aparato eléctrico dañado puede generar la chispa de ignición de una explosión de polvo" },
            { name: "Comprobar los interruptores de seguridad de puertas, caperuzas y cubiertas (daños y funcionamiento)", system: "Seguridad", frequency: "Trimestral", type: "Preventivo", acceptance: "En Automático, con la puerta abierta y pulsando ARRANQUE debe aparecer mensaje de anomalía y la máquina no debe arrancar. Cambiar de inmediato los interruptores dañados" },
            { name: "Limpiar y lubricar el husillo de ajuste de los pasadores de separación", system: "Estación de separación", frequency: "Trimestral", type: "Preventivo", acceptance: "Capa fina de Cassida Grease EPS 1" },
            { name: "Verificar conectadores enchufables y uniones de apriete del panel de mando", system: "HMI / armario eléctrico", frequency: "Semestral", type: "Preventivo", acceptance: "Bien puestos y sin defectos (Bosch Rexroth VDP40.3, R-911-173-921)" },
            { name: "Comprobar la función del freno de los servomotores AC en servicio", system: "Accionamientos", frequency: "Por horas: 2000 h", type: "Preventivo", acceptance: "Servomotores 8-108-175-006 (estación dosificadora) y 8-109-521-634 (principal)" },
            { name: "Verificar la estera filtrante, las láminas y los ruidos del ventilador con filtro del armario eléctrico", system: "Armario eléctrico", frequency: "Por horas: 2000 h", type: "Preventivo", acceptance: "Reemplazar la estera sucia. Reducir el intervalo según el grado de ensuciamiento del aire ambiente" },
            { name: "Verificar líneas, conectadores y ventiladores del PC industrial", system: "Control", frequency: "Por horas: 2000 h", type: "Preventivo", acceptance: "Sin roturas ni aplastamientos; reemplazar de inmediato las piezas defectuosas" },
            { name: "Revisión general de la aspiradora por el constructor o servicio posventa", system: "Aspiración de polvo", frequency: "Por horas: 2000 h", type: "Preventivo", acceptance: "Inspección del estado general del aparato" },
            { name: "Cambiar juntas y cojinetes", system: "Máquina completa", frequency: "Por horas: 5000 h", type: "Preventivo", acceptance: "Sustitución preventiva" },
            { name: "Comprobar y apretar las conexiones eléctricas de atornillamiento y apriete del armario eléctrico y las cajas de bornes", system: "Armario eléctrico", frequency: "Por horas: 5000 h", type: "Preventivo", acceptance: "Sólo especialista electrónico, con el interruptor principal desconectado y asegurado. Cambiar de inmediato los componentes dañados" },
            { name: "Comprobar obturaciones, caja y tapa de cojinete, engranajes y nivel de aceite del mecanismo paso a paso de dosificación", system: "Estación dosificadora", frequency: "Por horas: 5000 h", type: "Preventivo", acceptance: "Sin sobrecalentamiento, cambio de color, ruidos anormales ni juego (HTSG 133-6-H150, 8-104-242-001)" },
            { name: "Cambiar la pila CMOS del PC industrial", system: "Control", frequency: "Por horas: 10000 h", type: "Preventivo", acceptance: "—" },
            { name: "Cambiar el lubricante del motor de engranaje cónico de la alimentación de polvo y verificar los anillos-retén", system: "Alimentación de producto", frequency: "Por horas: 10000 h", type: "Preventivo", acceptance: "Reemplazar los anillos-retén con fugas (Lenze GKR04-2M, 8-108-170-987)" },
            { name: "Cambiar la batería del controller Elau LMC400", system: "Control", frequency: "Por horas: 10000 h", type: "Preventivo", acceptance: "—" },
            { name: "Reemplazar el acumulador del módulo SAI", system: "Armario eléctrico", frequency: "Por horas: 10000 h", type: "Preventivo", acceptance: "A 25 °C dura 10 años; la vida útil se reduce a la mitad por cada 10 °C de aumento de temperatura" },
            { name: "Reemplazar todos los elementos de obturación, rodamientos y rodillos de leva del mecanismo paso a paso de dosificación", system: "Estación dosificadora", frequency: "Por horas: 30000 h", type: "Preventivo", acceptance: "—" },
            { name: "Comprobación del estado seguro de dispositivos de protección, instalaciones de advertencia, bloqueos y acoplamientos por un especialista", system: "Seguridad", frequency: "Anual", type: "Preventivo", acceptance: "Como mínimo una vez al año; documentar los resultados en un certificado de comprobación" },
            { name: "Comprobar la eficacia de los dispositivos de aspiración de sustancias dañinas para la salud", system: "Aspiración", frequency: "Según necesidad", type: "Preventivo", acceptance: "Antes de la primera puesta en servicio y tras modificaciones; realizada por un especialista" },
            { name: "Comprobar la secuencia de movimiento sin colisiones en marcha paso a paso y el paso de cápsulas", system: "Mecánica general", frequency: "Según necesidad", type: "Preventivo", acceptance: "En cada preparación, antes de producir; en caso de colisión parar inmediatamente" },
            { name: "Comprobar el proceso de llenado y el peso de las cápsulas", system: "Estaciones de llenado", frequency: "Según necesidad", type: "Preventivo", acceptance: "En cada preparación de una estación de llenado, con varios ciclos en marcha paso a paso" },
            { name: "Almacenar los datos de lote en un medio externo y borrarlos del soporte interno", system: "Seguridad de datos", frequency: "Según necesidad", type: "Preventivo", acceptance: "Tras finalizar cada lote; directorio c:\\Customer\\BatchBackup\\... La vida útil de los soportes internos es limitada" },
            { name: "Puesta a cero de los servoaccionamientos", system: "Accionamientos", frequency: "Según necesidad", type: "Preventivo", acceptance: "Sólo tras cambio de correas dentadas o reparaciones de mayor envergadura y sólo por personal técnico formado; una puesta a cero incorrecta provoca colisiones y dosificaciones erróneas" },
            { name: "Prueba de lámparas del semáforo (pulsador 130)", system: "Señalización", frequency: "Según necesidad", type: "Preventivo", acceptance: "Cambiar las lámparas que no se iluminan" },
            { name: "Ajuste básico de la balanza tras reinstalar el programa de mando", system: "Balanza (si equipada)", frequency: "Según necesidad", type: "Preventivo", acceptance: "Después de cada recuperación de software" },
            { name: "Limpieza básica: desmontaje, limpieza convencional / ultrasonidos / lavadora y montaje", system: "Piezas en contacto con producto", frequency: "Según necesidad", type: "Preventivo", acceptance: "Convencional: rociar y dejar actuar 2 min, aclarar ≥1 min con agua tibia y ≥1 min con agua limpia, secar (≥30 min en armario). Ultrasonidos: ≈50 °C, mín. 5 min — ¡las piezas revestidas NO van a ultrasonidos (número en negrita/cursiva en el catálogo)! Lavadora: lavado máx. 60 °C, secado máx. 75 °C, detergente pH 5–8" }
          ],
          failureModes: [
            {
              name: "1/2/3 Fallo, advertencia o aviso del accionamiento principal [Code]", probableSystem: "Accionamiento principal", status: "Base manual consolidada",
              symptoms: ["Anomalía del servoaccionamiento principal; el aviso 3 muestra un código"],
              checks: ["Anomalía en el servoaccionamiento o en el servocontrol"],
              correction: "Accionar RESET. Si persiste: código NEGATIVO = anomalía interna del servoaccionamiento (ver descripción del cap. 6); código POSITIVO = número de mensaje del servocontrol, resolver con sus instrucciones. Código −200 = freno de retención abierto (fijar el freno)",
              steps: [{ title: "Causa probable y solución", where: "Accionamiento principal · manual pág. 303 / 356", how: "Anomalía en el servoaccionamiento o en el servocontrol", spec: null, tool: null, ifFail: "Accionar RESET. Si persiste: código NEGATIVO = anomalía interna del servoaccionamiento (ver descripción del cap. 6); código POSITIVO = número de mensaje del servocontrol, resolver con sus instrucciones. Código −200 = freno de retención abierto (fijar el freno)" }]
            },
            {
              name: "43 Error mecanismo de rodadura de levas", probableSystem: "Accionamiento principal", status: "Base manual consolidada",
              symptoms: ["La máquina no gira o se detiene"],
              checks: ["El accionamiento principal está bloqueado mecánicamente"],
              correction: "Comprobar todos los dispositivos accionados por el accionamiento principal respecto a colisiones o bloqueos y eliminarlos",
              steps: [{ title: "Causa probable y solución", where: "Accionamiento principal · manual pág. 304", how: "El accionamiento principal está bloqueado mecánicamente", spec: null, tool: null, ifFail: "Comprobar todos los dispositivos accionados por el accionamiento principal respecto a colisiones o bloqueos y eliminarlos" }]
            },
            {
              name: "47 Fallo de sincronización de los accionamientos / 48 Accionamientos no en disposición de servicio", probableSystem: "Accionamientos", status: "Base manual consolidada",
              symptoms: ["La máquina no arranca"],
              checks: ["Falló la comprobación de posición de al menos un servo, o hay anomalías en servos/servocontrol"],
              correction: "Realizar el desplazamiento de referencia de los servoaccionamientos (cap. 5). Para el 48: RESET, luego el pulsador de reset del aparato de servocontrol y, si persiste, avisar a un técnico Bosch",
              steps: [{ title: "Causa probable y solución", where: "Accionamientos · manual pág. 304", how: "Falló la comprobación de posición de al menos un servo, o hay anomalías en servos/servocontrol", spec: null, tool: null, ifFail: "Realizar el desplazamiento de referencia de los servoaccionamientos (cap. 5). Para el 48: RESET, luego el pulsador de reset del aparato de servocontrol y, si persiste, avisar a un técnico Bosch" }]
            },
            {
              name: "57 Posición incorrecta del accionamiento principal", probableSystem: "Accionamiento principal", status: "Base manual consolidada",
              symptoms: ["Diferencia excesiva entre encoder de concentricidad de segmento y transductor de valores absolutos"],
              checks: ["Desfase de posición por desajuste o fallo de transductor"],
              correction: "Poner a cero el servoaccionamiento principal (indicador a 0°); comprobar el encoder, la concentricidad de segmento y el transductor de valores absolutos",
              steps: [{ title: "Causa probable y solución", where: "Accionamiento principal · manual pág. 306", how: "Desfase de posición por desajuste o fallo de transductor", spec: null, tool: null, ifFail: "Poner a cero el servoaccionamiento principal (indicador a 0°); comprobar el encoder, la concentricidad de segmento y el transductor de valores absolutos" }]
            },
            {
              name: "53 / 63 PARADA DE EMERGENCIA (manejo / máquina)", probableSystem: "Seguridad", status: "Base manual consolidada",
              symptoms: ["Máquina detenida, semáforo rojo"],
              checks: ["Pulsador de golpe accionado"],
              correction: "Determinar y eliminar la causa; extraer el pulsador SÓLO cuando no exista peligro para personas ni máquina; después RESET",
              steps: [{ title: "Causa probable y solución", where: "Seguridad · manual pág. 306 / 307", how: "Pulsador de golpe accionado", spec: null, tool: null, ifFail: "Determinar y eliminar la causa; extraer el pulsador SÓLO cuando no exista peligro para personas ni máquina; después RESET" }]
            },
            {
              name: "87/88/89/90/91 Fallos del accionamiento de la estación de polvo", probableSystem: "Estación dosificadora", status: "Base manual consolidada",
              symptoms: ["Anomalía del servo de la estación 5, posición incorrecta o punto de referencia no encontrado"],
              checks: ["Anomalía en el servoaccionamiento; desfase respecto al accionamiento principal; sensor de referencia mal ajustado, desenchufado o defectuoso o cable dañado"],
              correction: "RESET; resolver con el número de mensaje del servocontrol; poner a cero el servo principal; realizar desplazamiento de referencia; ajustar/enchufar o sustituir el sensor y su cable",
              steps: [{ title: "Causa probable y solución", where: "Estación dosificadora · manual pág. 309-310", how: "Anomalía en el servoaccionamiento; desfase respecto al accionamiento principal; sensor de referencia mal ajustado, desenchufado o defectuoso o cable dañado", spec: null, tool: null, ifFail: "RESET; resolver con el número de mensaje del servocontrol; poner a cero el servo principal; realizar desplazamiento de referencia; ajustar/enchufar o sustituir el sensor y su cable" }]
            },
            {
              name: "93 ¡Comprobar el disco dosificador! / 98 Datos del disco dosificador incorrectos", probableSystem: "Estación dosificadora", status: "Base manual consolidada",
              symptoms: ["Bloqueo hasta confirmar; el control tiene valores erróneos (p. ej. tras montar un disco nuevo)"],
              checks: ["Se activó una versión de receta con otros datos del disco dosificador ajustable"],
              correction: "En Receta > GKF > Llenado 5 > Disco dosificador comparar los datos con los del disco montado; si coinciden pulsar ARRANQUE, si no introducir los datos correctos o montar el disco correcto",
              steps: [{ title: "Causa probable y solución", where: "Estación dosificadora · manual pág. 311-312", how: "Se activó una versión de receta con otros datos del disco dosificador ajustable", spec: null, tool: null, ifFail: "En Receta > GKF > Llenado 5 > Disco dosificador comparar los datos con los del disco montado; si coinciden pulsar ARRANQUE, si no introducir los datos correctos o montar el disco correcto" }]
            },
            {
              name: "95 / 96 / 97 Regulación de altura del disco dosificador en posición final o posición no alcanzada", probableSystem: "Estación dosificadora", status: "Base manual consolidada",
              symptoms: ["El disco llega al tope superior o inferior, o no alcanza la posición en el tiempo previsto"],
              checks: ["Zona de regulación del disco montado insuficiente; datos de disco incorrectos; encoder defectuoso o mal ajustado"],
              correction: "Montar un disco dosificador adecuado; introducir los datos correctos; comprobar y cambiar el encoder defectuoso",
              steps: [{ title: "Causa probable y solución", where: "Estación dosificadora · manual pág. 311-312", how: "Zona de regulación del disco montado insuficiente; datos de disco incorrectos; encoder defectuoso o mal ajustado", spec: null, tool: null, ifFail: "Montar un disco dosificador adecuado; introducir los datos correctos; comprobar y cambiar el encoder defectuoso" }]
            },
            {
              name: "99 Fallo de la presión de pistón de compresión", probableSystem: "Estación dosificadora", status: "Base manual consolidada",
              symptoms: ["Desviación excesiva entre presión ajustada y real"],
              checks: ["Presión de salida de la regulación de pistones mal ajustada"],
              correction: "Ajustar la presión de salida (valor de trabajo 3 bar) con los pulsadores Pres. pistón compr. +/−",
              steps: [{ title: "Causa probable y solución", where: "Estación dosificadora · manual pág. 312", how: "Presión de salida de la regulación de pistones mal ajustada", spec: null, tool: null, ifFail: "Ajustar la presión de salida (valor de trabajo 3 bar) con los pulsadores Pres. pistón compr. +/−" }]
            },
            {
              name: "100–117 Expulsor GKF no en posición NO conforme (1/1…2/9)", probableSystem: "Expulsión", status: "Base manual consolidada",
              symptoms: ["La espiga de evacuación no pasa a rechazo al aparecer una cápsula errónea"],
              checks: ["Cilindro defectuoso; tubería de aire desenchufada o con fuga; sensor mal ajustado, desenchufado o defectuoso; cable dañado"],
              correction: "Comprobar el cilindro sin presión respecto a suavidad de marcha y cambiarlo; enchufar o cambiar la tubería; ajustar/enchufar o sustituir el sensor; comprobar y cambiar el cable",
              steps: [{ title: "Causa probable y solución", where: "Expulsión · manual pág. 312-318", how: "Cilindro defectuoso; tubería de aire desenchufada o con fuga; sensor mal ajustado, desenchufado o defectuoso; cable dañado", spec: null, tool: null, ifFail: "Comprobar el cilindro sin presión respecto a suavidad de marcha y cambiarlo; enchufar o cambiar la tubería; ajustar/enchufar o sustituir el sensor; comprobar y cambiar el cable" }]
            },
            {
              name: "127–144 Expulsor GKF no en posición conforme (1/1…2/9)", probableSystem: "Expulsión", status: "Base manual consolidada",
              symptoms: ["La espiga no pasa a la posición de conforme con una cápsula buena"],
              checks: ["Las mismas que en 100–117"],
              correction: "Mismo procedimiento: cilindro, tubería de aire, sensor y cable",
              steps: [{ title: "Causa probable y solución", where: "Expulsión · manual pág. 318-324", how: "Las mismas que en 100–117", spec: null, tool: null, ifFail: "Mismo procedimiento: cilindro, tubería de aire, sensor y cable" }]
            },
            {
              name: "195 / 196 Sobrecarga de la expulsión de cápsulas (estaciones 10 y 11)", probableSystem: "Expulsión", status: "Base manual consolidada",
              symptoms: ["Se activa la protección de sobrecarga de los pasadores expulsores"],
              checks: ["Pasador expulsor bloqueado; sensor mal ajustado, desenchufado o defectuoso; cable dañado"],
              correction: "Comprobar el sistema mecánico de los pasadores expulsores y limpiarlos; ajustar o sustituir el sensor y revisar el cable",
              steps: [{ title: "Causa probable y solución", where: "Expulsión · manual pág. 324-325", how: "Pasador expulsor bloqueado; sensor mal ajustado, desenchufado o defectuoso; cable dañado", spec: null, tool: null, ifFail: "Comprobar el sistema mecánico de los pasadores expulsores y limpiarlos; ajustar o sustituir el sensor y revisar el cable" }]
            },
            {
              name: "242/250/251/252/253/256/257/258/259/469/890 Supervisión de tensión de fusibles", probableSystem: "Eléctrico", status: "Base manual consolidada",
              symptoms: ["Falta tensión en el circuito del fusible indicado (W00-F311, F203, F302, F303, F304, F307, F308, F310, F312, F510, F314)"],
              checks: ["Fusible disparado; cortocircuito en el cableado"],
              correction: "Averiguar y eliminar la causa con el esquema eléctrico, eliminar el cortocircuito y conectar el fusible",
              steps: [{ title: "Causa probable y solución", where: "Eléctrico · manual pág. 325-326 / 340 / 353", how: "Fusible disparado; cortocircuito en el cableado", spec: null, tool: null, ifFail: "Averiguar y eliminar la causa con el esquema eléctrico, eliminar el cortocircuito y conectar el fusible" }]
            },
            {
              name: "262 Sobretemperatura del armario eléctrico [Code]", probableSystem: "Armario eléctrico", status: "Base manual consolidada",
              symptoms: ["Temperatura demasiado alta en el armario indicado"],
              checks: ["Temperatura ambiente alta; rejilla o filtro sucios; regulador mal ajustado; ventilador defectuoso o equipo de refrigeración mal ajustado"],
              correction: "Dejar enfriar, bajar la temperatura ambiente, limpiar rejilla y filtro, ajustar el regulador (máx. 45 °C), comprobar/cambiar el ventilador y ajustar el equipo de refrigeración",
              steps: [{ title: "Causa probable y solución", where: "Armario eléctrico · manual pág. 327", how: "Temperatura ambiente alta; rejilla o filtro sucios; regulador mal ajustado; ventilador defectuoso o equipo de refrigeración mal ajustado", spec: null, tool: null, ifFail: "Dejar enfriar, bajar la temperatura ambiente, limpiar rejilla y filtro, ajustar el regulador (máx. 45 °C), comprobar/cambiar el ventilador y ajustar el equipo de refrigeración" }]
            },
            {
              name: "272 Guardamotor de la bomba de vacío", probableSystem: "Vacío", status: "Base manual consolidada",
              symptoms: ["Disparo del guardamotor por consumo excesivo"],
              checks: ["Bomba defectuosa o bloqueada; cortocircuito; orificios de aspiración obturados o mangueras estranguladas; salidas de aire tapadas; filtro sucio"],
              correction: "Cambiar la bomba, eliminar el cortocircuito o el bloqueo, comprobar y abrir las tuberías, destapar las salidas de aire, limpiar el inserto de filtro y rearmar el guardamotor",
              steps: [{ title: "Causa probable y solución", where: "Vacío · manual pág. 327", how: "Bomba defectuosa o bloqueada; cortocircuito; orificios de aspiración obturados o mangueras estranguladas; salidas de aire tapadas; filtro sucio", spec: null, tool: null, ifFail: "Cambiar la bomba, eliminar el cortocircuito o el bloqueo, comprobar y abrir las tuberías, destapar las salidas de aire, limpiar el inserto de filtro y rearmar el guardamotor" }]
            },
            {
              name: "274 Falta aire a presión", probableSystem: "Neumática", status: "Base manual consolidada",
              symptoms: ["La máquina señala falta de aire comprimido"],
              checks: ["Llave principal cerrada; tubería desmontada; presión demasiado baja en el regulador; manguera con fuga; interruptor de presión mal ajustado o defectuoso"],
              correction: "Abrir la llave, montar la tubería, ajustar la presión en el manómetro (≈6 bar), cambiar mangueras con fugas, ajustar o cambiar el interruptor de presión",
              steps: [{ title: "Causa probable y solución", where: "Neumática · manual pág. 328", how: "Llave principal cerrada; tubería desmontada; presión demasiado baja en el regulador; manguera con fuga; interruptor de presión mal ajustado o defectuoso", spec: null, tool: null, ifFail: "Abrir la llave, montar la tubería, ajustar la presión en el manómetro (≈6 bar), cambiar mangueras con fugas, ajustar o cambiar el interruptor de presión" }]
            },
            {
              name: "275 Falta vacío", probableSystem: "Vacío", status: "Base manual consolidada",
              symptoms: ["La máquina señala vacío insuficiente"],
              checks: ["Bomba desconectada; vacío mal ajustado; manguera con fuga; interruptor de presión sucio, mal ajustado o defectuoso"],
              correction: "Conectar la bomba, comprobar el vacío en el interruptor de presión y ajustarlo con la válvula reguladora, cambiar mangueras con fugas, limpiar/ajustar/cambiar el interruptor de presión",
              steps: [{ title: "Causa probable y solución", where: "Vacío · manual pág. 328", how: "Bomba desconectada; vacío mal ajustado; manguera con fuga; interruptor de presión sucio, mal ajustado o defectuoso", spec: null, tool: null, ifFail: "Conectar la bomba, comprobar el vacío en el interruptor de presión y ajustarlo con la válvula reguladora, cambiar mangueras con fugas, limpiar/ajustar/cambiar el interruptor de presión" }]
            },
            {
              name: "276 Falta aspiración de polvo", probableSystem: "Aspiración de polvo", status: "Base manual consolidada",
              symptoms: ["No hay señal o aspiración de la aspiradora"],
              checks: ["Aspiradora desconectada o llena; tubería deformada, obstruida o desenchufada; cable interrumpido o clavija desenchufada"],
              correction: "Conectar la aspiradora, vaciarla, conectar/limpiar/comprobar el recorrido de la tubería y revisar cable y clavija",
              steps: [{ title: "Causa probable y solución", where: "Aspiración de polvo · manual pág. 329", how: "Aspiradora desconectada o llena; tubería deformada, obstruida o desenchufada; cable interrumpido o clavija desenchufada", spec: null, tool: null, ifFail: "Conectar la aspiradora, vaciarla, conectar/limpiar/comprobar el recorrido de la tubería y revisar cable y clavija" }]
            },
            {
              name: "280 / 281 Sensor del depósito de cápsulas vacías defectuoso / Faltan cápsulas vacías", probableSystem: "Alimentación de cápsulas", status: "Base manual consolidada",
              symptoms: ["Señal no válida o nivel insuficiente"],
              checks: ["Sensor mal ajustado, desenchufado o defectuoso, cable dañado; depósito vacío; con transportador: tapa abierta, tubería de aire no conectada o conexión obstruida"],
              correction: "Ajustar/enchufar/cambiar el sensor y su cable; llenar el depósito; cerrar la tapa del transportador, conectar el aire y limpiar la conexión al depósito",
              steps: [{ title: "Causa probable y solución", where: "Alimentación de cápsulas · manual pág. 329", how: "Sensor mal ajustado, desenchufado o defectuoso, cable dañado; depósito vacío; con transportador: tapa abierta, tubería de aire no conectada o conexión obstruida", spec: null, tool: null, ifFail: "Ajustar/enchufar/cambiar el sensor y su cable; llenar el depósito; cerrar la tapa del transportador, conectar el aire y limpiar la conexión al depósito" }]
            },
            {
              name: "288 La alimentación de producto no está en disposición de servicio", probableSystem: "Alimentación de producto", status: "Base manual consolidada",
              symptoms: ["Fallo del convertidor de frecuencias o vigilancia de tiempo del árbol transportador"],
              checks: ["Anomalía del motor; cable dañado; sensor del anillo de producto mal ajustado/defectuoso; el árbol funciona o está parado más tiempo del ajustado"],
              correction: "Resolver con las instrucciones del convertidor; comprobar cable y sensor; comprobar que el árbol transporte producto al disco, aumentar el número de revoluciones y revisar el ajuste del sensor 'Altura de producto encima del disco dosificador' y el 'Tiempo de vigilancia alimentación producto'",
              steps: [{ title: "Causa probable y solución", where: "Alimentación de producto · manual pág. 330", how: "Anomalía del motor; cable dañado; sensor del anillo de producto mal ajustado/defectuoso; el árbol funciona o está parado más tiempo del ajustado", spec: null, tool: null, ifFail: "Resolver con las instrucciones del convertidor; comprobar cable y sensor; comprobar que el árbol transporte producto al disco, aumentar el número de revoluciones y revisar el ajuste del sensor 'Altura de producto encima del disco dosificador' y el 'Tiempo de vigilancia alimentación producto'" }]
            },
            {
              name: "289 Temperatura excesiva de la alimentación de producto", probableSystem: "Alimentación de producto", status: "Base manual consolidada",
              symptoms: ["El motor del árbol transportador se calienta en exceso"],
              checks: ["Árbol transportador bloqueado; rejilla de ventilador sucia; interruptor térmico o cable defectuoso"],
              correction: "Dejar enfriar el motor, desmontar y limpiar el árbol transportador, limpiar la rejilla y comprobar/cambiar cable e interruptor térmico",
              steps: [{ title: "Causa probable y solución", where: "Alimentación de producto · manual pág. 330", how: "Árbol transportador bloqueado; rejilla de ventilador sucia; interruptor térmico o cable defectuoso", spec: null, tool: null, ifFail: "Dejar enfriar el motor, desmontar y limpiar el árbol transportador, limpiar la rejilla y comprobar/cambiar cable e interruptor térmico" }]
            },
            {
              name: "290 Par de giro de la alimentación de producto excesivo", probableSystem: "Estación dosificadora", status: "Base manual consolidada",
              symptoms: ["El acoplamiento del engranaje de la estación dosificadora se desacopla"],
              checks: ["Estación dosificadora bloqueada, por ejemplo por suciedad; o sensor mal ajustado/defectuoso"],
              correction: "Desmontar y limpiar la estación dosificadora, el disco y todas las correderas; acoplar de nuevo; comprobar y en su caso aumentar la distancia entre disco dosificador y anillo de apoyo; ajustar o sustituir el sensor",
              steps: [{ title: "Causa probable y solución", where: "Estación dosificadora · manual pág. 331", how: "Estación dosificadora bloqueada, por ejemplo por suciedad; o sensor mal ajustado/defectuoso", spec: null, tool: null, ifFail: "Desmontar y limpiar la estación dosificadora, el disco y todas las correderas; acoplar de nuevo; comprobar y en su caso aumentar la distancia entre disco dosificador y anillo de apoyo; ajustar o sustituir el sensor" }]
            },
            {
              name: "291 Falta producto (anillo de producto)", probableSystem: "Alimentación de producto", status: "Base manual consolidada",
              symptoms: ["No hay suficiente producto en el anillo"],
              checks: ["Falta producto en el depósito; revoluciones del árbol transportador insuficientes; sensor mal ajustado o defectuoso"],
              correction: "Rellenar el depósito, aumentar las revoluciones del árbol y ajustar/cambiar el sensor y su cable",
              steps: [{ title: "Causa probable y solución", where: "Alimentación de producto · manual pág. 331", how: "Falta producto en el depósito; revoluciones del árbol transportador insuficientes; sensor mal ajustado o defectuoso", spec: null, tool: null, ifFail: "Rellenar el depósito, aumentar las revoluciones del árbol y ajustar/cambiar el sensor y su cable" }]
            },
            {
              name: "300–317 Suministro de depósito, pista obstruida (1/1…2/9)", probableSystem: "Almacén / ASB", status: "Base manual consolidada",
              symptoms: ["La pista indicada sigue obstruida tras varios soplados de la ASB"],
              checks: ["Banda de depósito del orificio de segmento indicado obstruida"],
              correction: "Limpiar con un cepillo la banda de depósito del orificio indicado; el número de intentos se ajusta en 'GKF: Fallo de suma de limpieza del almacén'",
              steps: [{ title: "Causa probable y solución", where: "Almacén / ASB · manual pág. 332-336", how: "Banda de depósito del orificio de segmento indicado obstruida", spec: null, tool: null, ifFail: "Limpiar con un cepillo la banda de depósito del orificio indicado; el número de intentos se ajusta en 'GKF: Fallo de suma de limpieza del almacén'" }]
            },
            {
              name: "342 / 343 Guardamotor y contactor de los accionamientos; 273 y 296 contactores de bomba de vacío y aspiradora", probableSystem: "Eléctrico", status: "Base manual consolidada",
              symptoms: ["Disparo del guardamotor o contactor que no desconecta"],
              checks: ["Cortocircuito en el cableado; contactor dañado"],
              correction: "Eliminar el cortocircuito y conectar el guardamotor; comprobar y cambiar el contactor dañado",
              steps: [{ title: "Causa probable y solución", where: "Eléctrico · manual pág. 328 / 332 / 337", how: "Cortocircuito en el cableado; contactor dañado", spec: null, tool: null, ifFail: "Eliminar el cortocircuito y conectar el guardamotor; comprobar y cambiar el contactor dañado" }]
            },
            {
              name: "358 / 389–395 Puertas de protección abiertas y 368 Circuito de protección no cerrado", probableSystem: "Seguridad", status: "Base manual consolidada",
              symptoms: ["La puerta indicada está abierta o mal cerrada; o con todas cerradas el PLC de seguridad indica circuito abierto"],
              checks: ["Puerta o cubierta abierta; relé de vigilancia defectuoso"],
              correction: "Cerrar la puerta/cubierta indicada; comprobar y cambiar el relé de vigilancia defectuoso",
              steps: [{ title: "Causa probable y solución", where: "Seguridad · manual pág. 337-339", how: "Puerta o cubierta abierta; relé de vigilancia defectuoso", spec: null, tool: null, ifFail: "Cerrar la puerta/cubierta indicada; comprobar y cambiar el relé de vigilancia defectuoso" }]
            },
            {
              name: "382 / 383 / 387 / 388 Interfaz con la máquina postconectada y atasco de salida", probableSystem: "Salida de cápsulas", status: "Base manual consolidada",
              symptoms: ["La GKF se para sin anomalía propia o las cápsulas se atascan en la canaleta"],
              checks: ["Anomalía o falta de disposición de la máquina postconectada; transporte siguiente insuficiente; sensor de atasco mal ajustado o defectuoso"],
              correction: "Eliminar la anomalía aguas abajo (la máquina rearranca automáticamente), poner la máquina siguiente en disposición de servicio, retirar las cápsulas de la canaleta y asegurar transporte suficiente; ajustar o cambiar el sensor y su cable",
              steps: [{ title: "Causa probable y solución", where: "Salida de cápsulas · manual pág. 337-338", how: "Anomalía o falta de disposición de la máquina postconectada; transporte siguiente insuficiente; sensor de atasco mal ajustado o defectuoso", spec: null, tool: null, ifFail: "Eliminar la anomalía aguas abajo (la máquina rearranca automáticamente), poner la máquina siguiente en disposición de servicio, retirar las cápsulas de la canaleta y asegurar transporte suficiente; ajustar o cambiar el sensor y su cable" }]
            },
            {
              name: "460/461/462 Depósito de producto 1 vacío o sensores mín./máx. defectuosos", probableSystem: "Alimentación de producto", status: "Base manual consolidada",
              symptoms: ["Falta producto o señal errónea de nivel"],
              checks: ["Depósito vacío; fallo de la alimentación automática externa; sensor mal ajustado, desenchufado o defectuoso; cable dañado"],
              correction: "Rellenar producto, comprobar la alimentación automática y ajustar/enchufar/cambiar el sensor y su cable",
              steps: [{ title: "Causa probable y solución", where: "Alimentación de producto · manual pág. 339-340", how: "Depósito vacío; fallo de la alimentación automática externa; sensor mal ajustado, desenchufado o defectuoso; cable dañado", spec: null, tool: null, ifFail: "Rellenar producto, comprobar la alimentación automática y ajustar/enchufar/cambiar el sensor y su cable" }]
            },
            {
              name: "730 / 760 Palpadores de exploración no en posición [Code]", probableSystem: "Exploración de cápsula", status: "Base manual consolidada",
              symptoms: ["Un pasador de exploración de la parte superior (730) o inferior (760) no vuelve a la posición básica; el código indica hilera/taladro"],
              checks: ["Pasadores sucios o con problema mecánico"],
              correction: "Comprobar el sistema mecánico de los pasadores de exploración y limpiarlos",
              steps: [{ title: "Causa probable y solución", where: "Exploración de cápsula · manual pág. 340 / 346", how: "Pasadores sucios o con problema mecánico", spec: null, tool: null, ifFail: "Comprobar el sistema mecánico de los pasadores de exploración y limpiarlos" }]
            },
            {
              name: "731–748 / 761–778 Fallo de suma de exploración de parte superior o inferior (1/1…2/9)", probableSystem: "Exploración / almacén", status: "Base manual consolidada",
              symptoms: ["Durante N ciclos no se explora tapa o cuerpo en el taladro indicado"],
              checks: ["Pista de almacén del taladro indicado obstruida a pesar de varias limpiezas"],
              correction: "Limpiar con un cepillo la banda de depósito del orificio de segmento indicado; revisar la alimentación y el traspaso al taladro",
              steps: [{ title: "Causa probable y solución", where: "Exploración / almacén · manual pág. 340-352", how: "Pista de almacén del taladro indicado obstruida a pesar de varias limpiezas", spec: null, tool: null, ifFail: "Limpiar con un cepillo la banda de depósito del orificio de segmento indicado; revisar la alimentación y el traspaso al taladro" }]
            },
            {
              name: "759 / 789 Fallo de suma segmento obstruido [Code]", probableSystem: "Segmentos", status: "Base manual consolidada",
              symptoms: ["Durante N ciclos no se explora cápsula en el mismo taladro del mismo segmento"],
              checks: ["Taladro de la parte superior (759) o inferior (789) del segmento obstruido"],
              correction: "El segmento afectado queda parado en la estación 7 (superior) o 4 (inferior); limpiar sus taladros con un cepillo",
              steps: [{ title: "Causa probable y solución", where: "Segmentos · manual pág. 346 / 353", how: "Taladro de la parte superior (759) o inferior (789) del segmento obstruido", spec: null, tool: null, ifFail: "El segmento afectado queda parado en la estación 7 (superior) o 4 (inferior); limpiar sus taladros con un cepillo" }]
            },
            {
              name: "891 El equipo de refrigeración +S200 no está en disposición de servicio", probableSystem: "Armario eléctrico", status: "Base manual consolidada",
              symptoms: ["Refrigeración del armario fuera de servicio"],
              checks: ["Fallo del equipo de refrigeración"],
              correction: "Eliminar el fallo con las instrucciones de servicio adicionales (cap. 10)",
              steps: [{ title: "Causa probable y solución", where: "Armario eléctrico · manual pág. 353", how: "Fallo del equipo de refrigeración", spec: null, tool: null, ifFail: "Eliminar el fallo con las instrucciones de servicio adicionales (cap. 10)" }]
            },
            {
              name: "Problemas de separación: cápsulas ovaladas, pegadas o no separadas", probableSystem: "Cápsulas / vacío", status: "Base manual consolidada",
              symptoms: ["Las cápsulas no se abren bien o salen deformadas"],
              checks: ["Temperaturas altas en transporte o almacenamiento; diferencia de temperatura excesiva entre almacén y recinto; vacío mal ajustado; filtro de la bomba sucio"],
              correction: "Mejorar las condiciones de almacenamiento y esperar a que las cápsulas se aclimaten; comprobar el vacío en el interruptor de presión y ajustarlo con la válvula reguladora (−0,1 a −0,4 bar); limpiar el inserto de filtro",
              steps: [{ title: "Causa probable y solución", where: "Cápsulas / vacío · manual pág. 298", how: "Temperaturas altas en transporte o almacenamiento; diferencia de temperatura excesiva entre almacén y recinto; vacío mal ajustado; filtro de la bomba sucio", spec: null, tool: null, ifFail: "Mejorar las condiciones de almacenamiento y esperar a que las cápsulas se aclimaten; comprobar el vacío en el interruptor de presión y ajustarlo con la válvula reguladora (−0,1 a −0,4 bar); limpiar el inserto de filtro" }]
            },
            {
              name: "El cuerpo de la cápsula salta hacia arriba tras la separación", probableSystem: "Estación de separación", status: "Base manual consolidada",
              symptoms: ["Parece que las cápsulas no están separadas"],
              checks: ["Vacío demasiado alto, en estaciones sin pasadores separadores o con separadores mal ajustados"],
              correction: "Reducir el vacío y revisar el ajuste de los pasadores de separación (elevación 1–2 mm)",
              steps: [{ title: "Causa probable y solución", where: "Estación de separación · manual pág. 396", how: "Vacío demasiado alto, en estaciones sin pasadores separadores o con separadores mal ajustados", spec: null, tool: null, ifFail: "Reducir el vacío y revisar el ajuste de los pasadores de separación (elevación 1–2 mm)" }]
            },
            {
              name: "Cápsulas deformadas o no introducidas en los segmentos; cápsulas empujadas de más o de menos en la clasificación", probableSystem: "Clasificación / segmentos", status: "Base manual consolidada",
              symptoms: ["Fallos de introducción y deformación en la clasificación"],
              checks: ["Correderas de clasificación mal ajustadas; culisa de las correderas desajustada; partes superiores de segmento no alineadas con las inferiores"],
              correction: "Ajustar las correderas para que empujen la tapa 1–2 mm fuera del bloque; desplazar la culisa hacia delante (si van demasiado adelantadas) o hacia atrás (si van retrasadas); alinear la parte superior de segmento",
              steps: [{ title: "Causa probable y solución", where: "Clasificación / segmentos · manual pág. 298-299", how: "Correderas de clasificación mal ajustadas; culisa de las correderas desajustada; partes superiores de segmento no alineadas con las inferiores", spec: null, tool: null, ifFail: "Ajustar las correderas para que empujen la tapa 1–2 mm fuera del bloque; desplazar la culisa hacia delante (si van demasiado adelantadas) o hacia atrás (si van retrasadas); alinear la parte superior de segmento" }]
            },
            {
              name: "Las tapas de cápsula correctas son aspiradas en la estación de cápsulas no conformes", probableSystem: "Estación de cápsulas defectuosas", status: "Base manual consolidada",
              symptoms: ["Se pierden tapas buenas del segmento superior"],
              checks: ["Aspiración o estribo de expulsión mal ajustados"],
              correction: "Corregir el ajuste con la corredera y la empuñadura en estrella hasta que se aspiren todas las cápsulas subidas y ninguna tapa correcta",
              steps: [{ title: "Causa probable y solución", where: "Estación de cápsulas defectuosas · manual pág. 299 / 461", how: "Aspiración o estribo de expulsión mal ajustados", spec: null, tool: null, ifFail: "Corregir el ajuste con la corredera y la empuñadura en estrella hasta que se aspiren todas las cápsulas subidas y ninguna tapa correcta" }]
            },
            {
              name: "Cápsulas telescópicas, ranuradas o abolladas tras el cierre", probableSystem: "Cierre / dosificación", status: "Base manual consolidada",
              symptoms: ["Cápsulas deformadas o comprimidas al cerrar"],
              checks: ["Cápsulas llenadas en exceso (el tapón sobresale); cápsulas demasiado cerradas; diámetro de los pasadores de cierre demasiado pequeño con piezas prensadas duras"],
              correction: "Ajustar la estación dosificadora o usar cápsulas adecuadas; ajustar la estación de cierre (saliente 1,0–1,5 mm, distancia cápsula–contrasoporte mín. 0,5 mm); usar pasadores de cierre de mayor diámetro (sólo tamaños 1–000)",
              steps: [{ title: "Causa probable y solución", where: "Cierre / dosificación · manual pág. 298-299 / 497-499", how: "Cápsulas llenadas en exceso (el tapón sobresale); cápsulas demasiado cerradas; diámetro de los pasadores de cierre demasiado pequeño con piezas prensadas duras", spec: null, tool: null, ifFail: "Ajustar la estación dosificadora o usar cápsulas adecuadas; ajustar la estación de cierre (saliente 1,0–1,5 mm, distancia cápsula–contrasoporte mín. 0,5 mm); usar pasadores de cierre de mayor diámetro (sólo tamaños 1–000)" }]
            },
            {
              name: "Anomalía por polvo: la máquina se para", probableSystem: "Estación dosificadora", status: "Base manual consolidada",
              symptoms: ["Bloqueo de la estación dosificadora"],
              checks: ["Polvo pegajoso, o polvo con punto de fusión > 50 °C"],
              correction: "En el polvo: añadir estearato de magnesio S (m=0,0991) o estearato de cinc S (m=0,0997). En la máquina: aumentar la calidad superficial de pistones, correderas y anillo de apriete, optimizar la altura del disco, aumentar la distancia disco–anillo de apriete (corredera +0,1 mm), inclinar el anillo de apriete o usar anillo de apoyo especialmente fresado",
              steps: [{ title: "Causa probable y solución", where: "Estación dosificadora · manual pág. 300 / 417", how: "Polvo pegajoso, o polvo con punto de fusión > 50 °C", spec: null, tool: null, ifFail: "En el polvo: añadir estearato de magnesio S (m=0,0991) o estearato de cinc S (m=0,0997). En la máquina: aumentar la calidad superficial de pistones, correderas y anillo de apriete, optimizar la altura del disco, aumentar la distancia disco–anillo de apriete (corredera +0,1 mm), inclinar el anillo de apriete o usar anillo de apoyo especialmente fresado" }]
            },
            {
              name: "Disgregación del polvo, expulsión del polvo del taladro o desmoronamiento del tapón", probableSystem: "Estación dosificadora", status: "Base manual consolidada",
              symptoms: ["El polvo se segrega, salpica al rellenar o el tapón se desmorona al expulsarlo"],
              checks: ["Polvo que no fluye bien; polvo con inclusiones de aire; polvo con alta tendencia de desprendimiento"],
              correction: "Usar polvo homogéneo o aumentar su peso específico/compresibilidad. En la máquina: optimizar las presiones de compresión (mayor en el punto a y decreciente: a>b>c>d>e), aumentar el nivel del anillo de producto, reducir el rendimiento, usar resortes más blandos (aire) o más duros (desprendimiento) y ajustar la distancia disco–anillo de apriete",
              steps: [{ title: "Causa probable y solución", where: "Estación dosificadora · manual pág. 300", how: "Polvo que no fluye bien; polvo con inclusiones de aire; polvo con alta tendencia de desprendimiento", spec: null, tool: null, ifFail: "Usar polvo homogéneo o aumentar su peso específico/compresibilidad. En la máquina: optimizar las presiones de compresión (mayor en el punto a y decreciente: a>b>c>d>e), aumentar el nivel del anillo de producto, reducir el rendimiento, usar resortes más blandos (aire) o más duros (desprendimiento) y ajustar la distancia disco–anillo de apriete" }]
            },
            {
              name: "Bloqueo del árbol transportador y daño de su motor", probableSystem: "Alimentación de producto", status: "Base manual consolidada",
              symptoms: ["El árbol queda bloqueado al llenar el anillo de producto"],
              checks: ["El producto se atasca en el depósito; se mantiene accionado el pulsador Aliment. prod. manual"],
              correction: "Accionar el pulsador sólo brevemente y dejar marchar la máquina varios ciclos en paso a paso para que el producto se distribuya uniformemente",
              steps: [{ title: "Causa probable y solución", where: "Alimentación de producto · manual pág. 109", how: "El producto se atasca en el depósito; se mantiene accionado el pulsador Aliment. prod. manual", spec: null, tool: null, ifFail: "Accionar el pulsador sólo brevemente y dejar marchar la máquina varios ciclos en paso a paso para que el producto se distribuya uniformemente" }]
            },
            {
              name: "Obstrucción del pozo de descarga en las estaciones de pastillas 6 y 8", probableSystem: "Estación de pastillas", status: "Base manual consolidada",
              symptoms: ["Caen demasiadas pastillas al pozo y se obstruye"],
              checks: ["Depósito llenado en exceso: la unidad de toberas no consigue retener las pastillas en marcha"],
              correction: "No llenar en exceso con Compri. man. est. 6/8; ajustar el sensor (4 h) y la unidad de toberas (11 h) en pasos pequeños; si ya está obstruido, desarmar la estación y limpiarlo",
              steps: [{ title: "Causa probable y solución", where: "Estación de pastillas · manual pág. 112 / 491", how: "Depósito llenado en exceso: la unidad de toberas no consigue retener las pastillas en marcha", spec: null, tool: null, ifFail: "No llenar en exceso con Compri. man. est. 6/8; ajustar el sensor (4 h) y la unidad de toberas (11 h) en pasos pequeños; si ya está obstruido, desarmar la estación y limpiarlo" }]
            },
            {
              name: "Alimentación de pastillas incorrecta (poco producto, vibrador continuo o exceso de producto)", probableSystem: "Estación de pastillas", status: "Base manual consolidada",
              symptoms: ["Pista interior sin llenar, vibrador que no para, producto en el lado izquierdo o pastillas sopladas fuera de los taladros"],
              checks: ["Nivel de producto mal ajustado; presión de la unidad de toberas insuficiente o excesiva; distancia placa de cierre–tubo incorrecta; tiempo de marcha de inercia demasiado largo"],
              correction: "Subir/bajar el sensor de nivel; aumentar o reducir la presión de la unidad de toberas; aumentar o reducir la distancia de la placa de cierre; reducir el 'Tiempo de marcha de inercia alimentación de pastillas'",
              steps: [{ title: "Causa probable y solución", where: "Estación de pastillas · manual pág. 493-494", how: "Nivel de producto mal ajustado; presión de la unidad de toberas insuficiente o excesiva; distancia placa de cierre–tubo incorrecta; tiempo de marcha de inercia demasiado largo", spec: null, tool: null, ifFail: "Subir/bajar el sensor de nivel; aumentar o reducir la presión de la unidad de toberas; aumentar o reducir la distancia de la placa de cierre; reducir el 'Tiempo de marcha de inercia alimentación de pastillas'" }]
            },
            {
              name: "Dosificación de pellets nula, insuficiente o excesiva", probableSystem: "Estación de llenado de pellets", status: "Base manual consolidada",
              symptoms: ["No se libera producto o se libera demasiado en cada giro"],
              checks: ["Distancia A del disco de retención demasiado pequeña o demasiado grande"],
              correction: "Añadir un disco entre el disco de retención y el árbol transportador para aumentar A, o extraerlo para reducirla; el disco no debe tocar el depósito",
              steps: [{ title: "Causa probable y solución", where: "Estación de llenado de pellets · manual pág. 438", how: "Distancia A del disco de retención demasiado pequeña o demasiado grande", spec: null, tool: null, ifFail: "Añadir un disco entre el disco de retención y el árbol transportador para aumentar A, o extraerlo para reducirla; el disco no debe tocar el depósito" }]
            },
            {
              name: "Colisión en el recinto de producción durante la preparación", probableSystem: "Mecánica general", status: "Base manual consolidada",
              symptoms: ["Colisión de componentes y daños en la máquina"],
              checks: ["Piezas de formato o componentes no montados o mal ajustados antes de arrancar en marcha a pasos"],
              correction: "Parar la máquina inmediatamente; arrancar sólo con todas las piezas de formato y componentes montados y ajustados, y comprobar la secuencia lentamente en paso a paso",
              steps: [{ title: "Causa probable y solución", where: "Mecánica general · manual pág. 105", how: "Piezas de formato o componentes no montados o mal ajustados antes de arrancar en marcha a pasos", spec: null, tool: null, ifFail: "Parar la máquina inmediatamente; arrancar sólo con todas las piezas de formato y componentes montados y ajustados, y comprobar la secuencia lentamente en paso a paso" }]
            },
            {
              name: "78 / 79 Error de datos por apagado sin SAI y advertencia de SAI", probableSystem: "Control / SAI", status: "Base manual consolidada",
              symptoms: ["Error de datos tras apagado no controlado; cable USB del SAI desenchufado"],
              checks: ["El PC industrial se apagó sin suministro ininterrumpido"],
              correction: "Reiniciar el PC (desconectar el interruptor principal, esperar a que se apague y volver a conectar) y comprobar los contadores; enchufar el cable USB del SAI",
              steps: [{ title: "Causa probable y solución", where: "Control / SAI · manual pág. 307-308", how: "El PC industrial se apagó sin suministro ininterrumpido", spec: null, tool: null, ifFail: "Reiniciar el PC (desconectar el interruptor principal, esperar a que se apague y volver a conectar) y comprobar los contadores; enchufar el cable USB del SAI" }]
            },
            {
              name: "84 / advertencia 26 Capacidad del disco duro", probableSystem: "Control", status: "Base manual consolidada",
              symptoms: ["Memoria libre insuficiente en el soporte de datos interno"],
              checks: ["Acumulación de datos de lote y copias de seguridad"],
              correction: "Almacenar los datos de lote antiguos en medios externos y borrar las copias de seguridad del soporte interno",
              steps: [{ title: "Causa probable y solución", where: "Control · manual pág. 309 / 354", how: "Acumulación de datos de lote y copias de seguridad", spec: null, tool: null, ifFail: "Almacenar los datos de lote antiguos en medios externos y borrar las copias de seguridad del soporte interno" }]
            },
            {
              name: "Fallo total del programa de mando", probableSystem: "Control", status: "Base manual consolidada",
              symptoms: ["El programa no responde ni arranca"],
              checks: ["Fallo del software de mando"],
              correction: "Desconectar el interruptor principal, esperar a que el PC industrial se apague y la máquina quede completamente desconectada, y volver a conectar. Si no arranca, contactar con un técnico de servicio de Bosch",
              steps: [{ title: "Causa probable y solución", where: "Control · manual pág. 301", how: "Fallo del software de mando", spec: null, tool: null, ifFail: "Desconectar el interruptor principal, esperar a que el PC industrial se apague y la máquina quede completamente desconectada, y volver a conectar. Si no arranca, contactar con un técnico de servicio de Bosch" }]
            },
            {
              name: "Anomalía del servocontrol Schneider", probableSystem: "Servocontrol", status: "Base manual consolidada",
              symptoms: ["Fallo del servocontrol"],
              checks: ["A determinar por el análisis de Bosch"],
              correction: "Ejecutar PacDrive Diagnostics (se requiere teclado): conectar (Verbinden), Startseite, guardar el archivo con nombre 'Número de máquina_nombre predefinido' en formato *.pdi y enviarlo a los técnicos de mantenimiento de Bosch",
              steps: [{ title: "Causa probable y solución", where: "Servocontrol · manual pág. 360-361", how: "A determinar por el análisis de Bosch", spec: null, tool: null, ifFail: "Ejecutar PacDrive Diagnostics (se requiere teclado): conectar (Verbinden), Startseite, guardar el archivo con nombre 'Número de máquina_nombre predefinido' en formato *.pdi y enviarlo a los técnicos de mantenimiento de Bosch" }]
            }
          ],
          documents: [
            { name: "Manual de instrucciones 745632 v1.0 es (594 págs.)", status: "Disponible", file: "manuales/gkf2600/GKF2600-manual-instrucciones-es.pdf" },
            { name: "Catálogo de repuestos 8100745632 (196 págs.)", status: "Disponible", file: "manuales/gkf2600/GKF2600-catalogo-repuestos-es.pdf" },
            { name: "Standardized PM Kits GKF 2600 (Bosch)", status: "Disponible", file: "manuales/gkf2600/GKF2600-PM-Kits-Bosch.pdf" },
            { name: "Esquema eléctrico con lista de aparatos (en el armario)", status: "Pendiente de digitalizar" },
            { name: "Tarjeta USB Technical Documentation (piezas OEM)", status: "Pendiente de digitalizar" }
          ]
        },
        {
          id: "integra320",
          equipoCod: "17332004",
          causaCod: "K8",
          causaDesc: "BLISTEADO 1 ULHMAN UPS300 (130699 - Blisteado y empaque)",
          name: "Blistera Marchesini Integra 320",
          model: "Integra 320",
          current: "",
          area: "Producción · Empaque primario (blíster)",
          location: "C.I. Farmacápsulas S.A.",
          status: "Operativo",
          criticality: "Alta",
          manual: "Calibrado y regulaciones M4160012",
          maintenance: "",
          completion: 85,
          image: "assets/integra320/despiece/p023.jpg",
          notes: "",
          searchAliases: ["integra","integra320","integra 320","blister","blistera","blisteadora","marchesini","mb432","m4160012","farmacapsulas","sea vision","harlequin","vision","formado","sellado","termoformado","pvc","aluminio","calibracion","fase","fasatura","K8","130699","causa K8"],
          description: "Máquina blisteradora Marchesini Integra 320 de C.I. Farmacápsulas: forma el alvéolo en film de PVC, lo llena, lo sella con aluminio, codifica y corta el blíster. Incluye los procedimientos de calibración y fase del manual, el cambio de formato, el despiece del catálogo con 81 calibraciones documentadas y las alarmas del sistema de visión SEA Vision.",
          technicalData: {
            function: "Formado, llenado, sellado, codificado y corte de blísteres (empaque primario).",
            manufacturer: "Marchesini Group S.p.A. (Pianoro, Bolonia, Italia)",
            brand: "Marchesini",
            serialNumber: "Ver placa de identificación de la máquina",
            year: "—",
            voltage: "Ver placa de características eléctricas",
            control: "Sistema de visión SEA Vision Harlequin para inspección del blíster",
            weight: "—",
            dimensions: "—"
          },
          summarySpecs: [
            { label: "Tipo", value: "Blistera (empaque primario)" },
            { label: "Fabricante", value: "Marchesini Group" },
            { label: "Materiales", value: "Film PVC + lámina de aluminio" },
            { label: "Inspección", value: "SEA Vision Harlequin" },
            { label: "Calibraciones", value: "70 procedimientos de fase" },
            { label: "Despiece", value: "399 tablas · 1.530 códigos" }
          ],
          alarms: true,
          guideSections: [
            {
              id: "int-como-funciona",
              title: "¿Cómo funciona? — el proceso de blisteado",
              content: `
<p style="font-size:1.02rem">La <strong>Integra 320</strong> es una <strong>blistera</strong>: forma alvéolos en una lámina de PVC, los llena con el producto, sella encima la lámina de aluminio, imprime/graba el lote y corta los blísteres.</p><div class="alert-box" style="background:#eef4ff;border-color:#cdddff">El recorrido del film es continuo: <strong>desbobinado → precalentamiento → formado → llenado → control → sellado → codificado → corte → expulsión</strong>. Todo va <strong>sincronizado por fases</strong>: por eso las calibraciones de fase son tan importantes.</div><div class="step-card"><div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Lectura de la ficha técnica de planteamiento</span></div><div class="step-card__row"><span>Qué hace</span><span>Traduce el producto a fabricar en una lista de piezas a sustituir y de valores a programar en cada dispositivo de la blistera.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Cada dispositivo regulable lleva un número impreso; ese número aparece en la columna D de la ficha con un círculo de color que indica a qué grupo pertenece (máquina, alimentación, accesorios o automático por ordenador). En las columnas de datos personalizados, el dato doble da arriba el código de la pieza de formato a montar y abajo el valor a programar en ese mismo dispositivo.</span></div><div class="step-card__row"><span>Mecánica</span><span>Sustitución de piezas de formato codificadas y regulación mecánica de los dispositivos.</span></div><div class="step-card__row"><span>Eléctrica</span><span>Las operaciones marcadas con círculo rojo son automáticas y se ejecutan sólo mediante ordenador (HMI).</span></div><div class="step-card__params"><strong>Ajustes:</strong> A = producto/material; B = velocidad de máquina para ese producto; C = dimensiones del producto/material; G = los datos comunes a varios formatos se escriben una sola vez.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Programación de un regulador numérico o pomo</span></div><div class="step-card__row"><span>Qué hace</span><span>Lleva el dispositivo al valor exacto indicado por la ficha eliminando el juego mecánico del husillo.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Si el nuevo valor es SUPERIOR al actual, se gira el control en sentido horario en una única operación hasta el nuevo valor. Si el nuevo valor es INFERIOR, se hacen dos operaciones: primero girar en sentido antihorario hasta pasarse por debajo del objetivo y luego en sentido horario hasta el nuevo valor.</span></div><div class="step-card__row"><span>Mecánica</span><span>La aproximación final siempre en sentido horario garantiza la repetibilidad de la cota.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Ejemplos del manual: 100 -> 150 (horario directo a 150); 100 -> 40 (antihorario hasta 35, luego horario hasta 40).</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">Puesta en seguridad previa</span></div><div class="step-card__row"><span>Qué hace</span><span>Impide puestas en marcha peligrosas durante el cambio de formato.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Siempre se parte de un STOP SINCRONIZADO (stop in fase) con el pulsador STOP y sólo con el ciclo terminado se pasa a la condición elegida: interruptor general a '0' y grifo neumático cerrado (bloqueo total), pulsador de EMERGENCIA (bloqueo parcial) o mando a distancia en su toma (movimiento controlado).</span></div><div class="step-card__row"><span>Mecánica</span><span>Grifo de corte de la instalación neumática, candados de bloqueo opcionales.</span></div><div class="step-card__row"><span>Eléctrica</span><span>Interruptor general, pulsadores de emergencia, RESET y toma del mando a distancia en el cuadro de mando.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Con mando a distancia, velocidad máx. 30/35 ciclos/min.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Transporte y salida de blísteres hacia la máquina línea abajo</span></div><div class="step-card__row"><span>Qué hace</span><span>Traslada los blísteres desde la blistera hasta el robot y el almacén de estuches de la máquina situada línea abajo.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Una correa dentada con dientes de empuje arrastra cada blíster; la correa está guiada por guías laterales, accionada por una polea motriz y tensada mediante un rodillo con tornillos de regulación que se ajustan simétricamente.</span></div><div class="step-card__row"><span>Mecánica</span><span>Correa dentada con dientes de empuje perpendiculares y bien sujetos; tramos A y B del transportador unidos por una junta con tornillos y clavijas; rodillo extraíble mediante perno; tubos (cannotti) que sostienen el robot sobre la cinta; distanciador entre la banda y la cinta de salida del blíster.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Excursión máxima de la correa: 30 mm. Control de desgaste cada H (900); control de tensado cada H (1800).</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Orientación del producto en el recorrido de alimentación</span></div><div class="step-card__row"><span>Qué hace</span><span>Orienta el producto antes de su introducción en el alvéolo del blíster.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Cepillos y escobillas giratorias cuyas cerdas rozan el producto y lo colocan en la posición correcta; el grupo se acciona mediante correa de transmisión dentada.</span></div><div class="step-card__row"><span>Mecánica</span><span>Cepillo giratorio desmontable del recorrido de alimentación; escobillas fijadas por dos pomos (3 y 4) y protegidas por coberturas; correa dentada alojada bajo la tapa delantera, con poleas de perfil dentado.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Limpieza con aire comprimido y control de desgaste cada H (300); sustituir cuando las cerdas ya no orienten el producto. Correa de transmisión: control cada H (1800).</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">Puesta en fase general de la máquina</span></div><div class="step-card__row"><span>Qué hace</span><span>Sincroniza todos los movimientos de la motorización principal entre sí.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Desde el display se ejecuta la función PUESTA EN FASE (rifasamento); después se comprueba en cada grupo que las muescas coloreadas de referencia queden alineadas y, si no lo están, se afloja el elemento de fijación (tornillos, perno del rotor), se gira el órgano (disco, leva, piñón, junta) hasta alinear las muescas y se vuelve a apretar.</span></div><div class="step-card__row"><span>Mecánica</span><span>Discos, levas, piñones, rotores y juntas con muescas coloreadas de referencia; brazos portaventosas; placas.</span></div><div class="step-card__row"><span>Eléctrica</span><span>Display de mando; sensores de posición (el rotor debe quedar con el sensor encendido en la estación de precalentamiento).</span></div><div class="step-card__params"><strong>Ajustes:</strong> Todas las fichas de este bloque exigen muescas alineadas; en precalentamiento además placas en máxima abertura y sensor encendido.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">Toma y transporte del blíster (grupo cicloide)</span></div><div class="step-card__row"><span>Qué hace</span><span>Toma el blíster mediante ventosas montadas en brazos giratorios y lo transporta con movimiento cicloidal.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Los ejes de rotación de las ventosas deben quedar nivelados en la posición de la figura y las ventosas alineadas; la posición se corrige girando el piñón central tras desmontar la placa del cicloide.</span></div><div class="step-card__row"><span>Mecánica</span><span>Volante manual, brazos portaventosas, placa del cicloide, piñón central, ventosas.</span></div><div class="step-card__row"><span>Eléctrica</span><span>Distribuidor de vacío y conductos de aspiración (ver mantenimiento del grupo).</span></div><div class="step-card__params"><strong>Ajustes:</strong> Ejes de rotación nivelados (uso de nivel); ventosas en línea según figura (C).</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">Expulsión del blíster</span></div><div class="step-card__row"><span>Qué hace</span><span>Expulsa el blíster terminado del grupo cicloide hacia la salida.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Movimiento accionado por una leva; la fase se comprueba tras la puesta en fase verificando la alineación de dos muescas coloreadas y se restablece aflojando los tornillos y girando la leva.</span></div><div class="step-card__row"><span>Mecánica</span><span>Leva de mando de extracción del blíster con tornillos de fijación.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Muescas (3 y 4) alineadas.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">Precalentamiento de la película de formación</span></div><div class="step-card__row"><span>Qué hace</span><span>Calienta la película de formación entre dos placas de precalentamiento antes del formado.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>La motorización posterior mueve las placas entre posición cerrada y de máxima abertura; en máxima abertura el rotor debe estar en la posición de la figura con el sensor encendido. La altura de las placas se regula con un índice numérico puesto a cero con los soportes a fondo de carrera hacia arriba.</span></div><div class="step-card__row"><span>Mecánica</span><span>Junta del motor, rotor con perno de fijación, placas de precalentamiento (5 y 6) y sus soportes, índice de altura con collar y pasador.</span></div><div class="step-card__row"><span>Eléctrica</span><span>Sensor de posición del rotor (debe estar encendido en la posición de fase); termorreguladores de precalentamiento.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Placas en máxima abertura; sensor encendido; índice de altura 9990 → 0000.</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">10</span><span class="step-card__title">Concepto general del sistema Harlequin</span></div><div class="step-card__row"><span>Qué hace</span><span>Efectúa el control de los productos confeccionados en máquinas termoformadoras: control de productos confeccionados en blíster, control de componentes en caja y control de los anillos de color serigrafiados en ampollas y jeringuillas. Además soporta cámaras de vídeo multifunción para control de datos impresos (OCV/OCR), de códigos (de barras, 2D y alfanuméricos), de la calidad de impresión (PQV) y controles especiales mediante medidas programables.</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>De cada (grupo de) producto que alcanza la estación de control, Harlequin adquiere una imagen por cada cámara de vídeo instalada y efectúa sobre la imagen las medidas programadas por el usuario. Los valores detectados por cada comprimido se comparan con los de referencia y, aunque uno solo resulte fuera de la banda de tolerancia permitida, el blíster que contiene el comprimido defectuoso es descartado de la línea de producción.</span></div><div class="step-card__row"><span>Mecánica</span><span>Estación de control montada sobre la termoformadora (blistera)</span></div><div class="step-card__row"><span>Eléctrica</span><span>Cámaras de vídeo (telecámaras) estándar y multifunción conectadas al sistema; salidas de descarte hacia la máquina</span></div><div class="step-card__params"><strong>Ajustes:</strong> Resultado binario final: blíster bueno / blíster defectuoso</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">11</span><span class="step-card__title">Cadena de elaboración - paso 1</span></div><div class="step-card__row"><span>Qué hace</span><span>Adquisición de la imagen desde la cámara de vídeo</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Resultado: imagen (matriz de números) en la memoria</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">12</span><span class="step-card__title">Cadena de elaboración - paso 2</span></div><div class="step-card__row"><span>Qué hace</span><span>Búsqueda de los objetos dentro de las ventanas de búsqueda diseñadas por el usuario</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Resultado: punto coloreado que indica la posición del objeto en la imagen</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">13</span><span class="step-card__title">Cadena de elaboración - paso 3</span></div><div class="step-card__row"><span>Qué hace</span><span>Medida: individuación del contorno del objeto</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Resultado: conjunto de puntos que definen el borde del objeto</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">14</span><span class="step-card__title">Cadena de elaboración - paso 4</span></div><div class="step-card__row"><span>Qué hace</span><span>Medida: cálculo de los parámetros que describen el objeto (área, parámetros de forma, niveles de color, ...)</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Resultado: conjunto de números que describen el objeto</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">15</span><span class="step-card__title">Cadena de elaboración - paso 5</span></div><div class="step-card__row"><span>Qué hace</span><span>Comparación entre los valores medidos y los valores nominales (aprendidos)</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>El objeto es bueno si todas las diferencias son inferiores a las tolerancias programadas. Resultado: objeto bueno / objeto con defecto</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">16</span><span class="step-card__title">Cadena de elaboración - paso 6</span></div><div class="step-card__row"><span>Qué hace</span><span>Gestión de los resultados: introducción y extracción de las colas de descarte</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Resultado: comunicación del éxito del control</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">17</span><span class="step-card__title">Trabajo automático</span></div><div class="step-card__row"><span>Qué hace</span><span>Lleva el sistema al estado de trabajo automático (online); Harlequin no acepta más mandos del operador excepto la salida del trabajo automático</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Con la máquina parada aparece abajo a la derecha el botón FIN AUTOMÁTICO; cuando la máquina arranca el pulsador desaparece. Durante la marcha, al presentarse ciertas condiciones Harlequin puede detener la máquina bajando la señal de marcha permitida y muestra en el monitor el motivo de la detención.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Informaciones en pantalla: diseños de control, colas de descarte, ventana de mensajes, ventana de contadores</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">18</span><span class="step-card__title">Exclusión del control</span></div><div class="step-card__row"><span>Qué hace</span><span>Permite que la máquina trabaje sin control de visión</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Levanta la señal de marcha permitida y al mismo tiempo envía a la máquina la señal de control excluido. Con el control excluido todos los blísters son descartados o dejados pasar según lo programado en el campo Estado de las Salidas de la página de Parámetros de Trabajo. La tecla Fin exclusión devuelve Harlequin al estado de espera de mandos del operador.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Campo 'Estado de las Salidas' en Parámetros de Trabajo</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">19</span><span class="step-card__title">Artículos asociados (blíster multiproducto)</span></div><div class="step-card__row"><span>Qué hace</span><span>Controla blísters con más de un producto usando el artículo base más artículos asociados</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Modos: A+B+C (multiproducto en AND: descarta si uno de los artículos indica blíster con defecto); A B C... A B C... (multiproducto alternado: usa un artículo a la vez en secuencia, imagen 1=A, imagen 2=B, imagen 3=C, imagen 4=A...); A|B|C (multiproducto en OR: toma el mejor resultado, los artículos asociados deben contener el mismo número de blísters y alvéolos); A+B+C (-Búsqueda: alvéolo vacío si al menos una búsqueda fracasa, si no toma el peor resultado); A|B|C (-Medida: alvéolo vacío si todas las búsquedas fallan, bueno si uno o más artículos indica blíster bueno y en los otros la búsqueda falla); A^B^C (bueno sólo si un único artículo indica buena la medida y todas las otras búsquedas fallan; vacío si todas fallan; en caso contrario se descarta).</span></div><div class="step-card__params"><strong>Ajustes:</strong> Numeración de ventanas de alvéolo, de izquierda a derecha: número del artículo (1 = artículo base), número del blíster, número del alvéolo</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">20</span><span class="step-card__title">Osciloscopio de señales E/S</span></div><div class="step-card__row"><span>Qué hace</span><span>Visualiza las señales de entrada/salida registradas durante la marcha de la máquina</span></div><div class="step-card__row"><span>Cómo lo hace</span><span>Durante el trabajo automático Harlequin crea un archivo con todas las conmutaciones de las señales, desde algunos segundos antes de la puesta en marcha de la máquina hasta algunos segundos después de su parada. La tecla Lista de los Ficheros abre la página con los ficheros almacenados en orden cronológico; con Visualiza Señales se accede al osciloscopio del fichero seleccionado. Una señal por línea: arriba las entradas, abajo las salidas. El gráfico se desplaza en horizontal con las teclas de flecha.</span></div><div class="step-card__params"><strong>Ajustes:</strong> Resolución del cuadrito (teclas zoom): de 1 segundo (resolución mínima) a 1 milisegundo (resolución máxima). Colores: negro = nivel lógico bajo toda la duración del cuadrito; rojo = nivel lógico alto toda la duración; amarillo = ambos niveles dentro del cuadrito. La columna con colores invertidos indica el instante en que Harlequin generó la alarma.</div></div>
              `
            },
            {
              id: "int-flujo",
              title: "Entradas → Transformación → Salidas",
              content: `
<p>Todo lo que <strong>entra</strong>, cómo se <strong>transforma</strong> y todo lo que <strong>sale</strong>.</p><div class="io-flow"><div class="io-col io-col--in"><div class="io-col__head">↘ ENTRADAS<small>Lo que necesita</small></div><div class="io-col__body"><ul><li><strong>Ficha técnica de planteamiento (scheda tecnica di impostazione) del producto</strong> — <em>F1 DATO ÚNICO: dato que se programará en el dispositivo. F2 DATO DOBLE: arriba, código de la pieza que se tiene que sustituir; abajo, dato que se programará en el dispositivo.</em>: Documento personalizado que es la ENTRADA de datos del cambio de formato. Campos: A = identificación del producto/material (nombre o código); B = velocidad de la máquina referida al producto; C = dimensiones del producto/material; D = identificación de la operación (número que lleva cada dispositivo); E = breve descripción; F = columnas de datos personalizados; G = un dato compartido por varios formatos se escribe una sola vez.</li><li><strong>Código de colores de los círculos de la ficha (identificación de la operación)</strong> — <em>Verde / Amarillo / Azul / Rojo</em>: CÍRCULO VERDE: operaciones en los grupos máquina. CÍRCULO AMARILLO: operaciones en los grupos de alimentación. CÍRCULO AZUL: operaciones en los grupos accesorios. CÍRCULO ROJO: operaciones automáticas (sólo mediante ordenador / HMI).</li><li><strong>Galgas (DIME) codificadas en dotación</strong>: Suministradas con la propia instalación; su código se cita en cada descripción de operación que las requiere.</li><li><strong>Accesorios y herramientas especiales en dotación</strong>: Herramientas hechas a medida para regulaciones estandarizadas o para puntos de acceso difícil, y herramientas de medición para calibrados especiales.</li><li><strong>Características del producto y condiciones de trabajo</strong>: Deben verificarse antes de cualquier variación, junto con el desgaste o rotura de piezas.</li><li><strong>Película de formación (bobina)</strong> — <em>Anchura regulada por el índice del grupo M4M25100930 (puesta a cero 9990 → 0000)</em>: Se desenrolla en el grupo M4M25100930 (rodillo de desenrollado) y se guía por los rodillos de reenvío M4M25200540 hacia el precalentamiento y el formado. Dispone de grupo de unión/empalme M4A22300630.</li><li><strong>Película de cobertura (bobina)</strong> — <em>No indicado en este bloque</em>: Se une a la película de formación en la estación de soldadura M4M60101840. Dispone de grupo de unión/empalme M4A22300720.</li><li><strong>Producto (comprimidos)</strong> — <em>No indicado en este bloque</em>: Alimentado por la taza vibratoria M4G06204E10 y las paletas de alimentación de comprimidos M4G12107720 a través de la cabeza de alimentación M4G12400720.</li><li><strong>Aire comprimido</strong> — <em>Presión no indicada en este bloque</em>: Instalación neumática con grifo de corte que se cierra en el BLOQUEO TOTAL de la instalación (bloqueable con candado).</li><li><strong>Energía eléctrica</strong> — <em>Valores eléctricos no indicados en este bloque</em>: Entra por el interruptor general (posición "0" para bloqueo total) y se distribuye desde el armario eléctrico M4M96101410 (con filtros y ventiladores de enfriamiento). Placa de características eléctricas en la máquina.</li><li><strong>Líquido de refrigeración</strong> — <em>No indicado en este bloque</em>: Sistema de refrigeración de la máquina M4M92100320 con líquido interno y medidores de flujo (flusostatos).</li><li><strong>Página Entradas y Salidas (cuadro sinóptico de señales)</strong> — <em>La cruz en la casilla aparece cuando la señal está activa. Acceso: Menú del Sistema → Configuración → Entradas y Salidas</em>: Visualiza el cuadro sinóptico de todas las señales de comunicación con el exterior. En la parte alta aparecen las señales de ENTRADA y abajo las de SALIDA, cada una con su significado, la puerta de E/S, el número del bit de la puerta y el tipo de lógica usada (positiva o negativa).</li><li><strong>Señal de sincronización (trigger) de telecámara</strong>: La imagen de referencia se adquiere con la señal de trigger generada dentro de un tiempo de espera desde el instante en que se aprieta el pulsador. Esta función levanta temporalmente la señal de marcha permitida.</li><li><strong>Mandos remotos desde puerta serial o red local</strong>: Las operaciones efectuadas mediante mandos remotos se atribuyen al usuario Extern. Extern debe estar dotado de las habilitaciones de Cambio artículo, Gestión de los lotes y Arranque máquina para pruebas para poder efectuar los relativos mandos remotos.</li></ul></div></div><div class="io-col io-col--proc"><div class="io-col__head">⟳ TRANSFORMACIÓN<small>Lo que pasa adentro</small></div><div class="io-col__body"><ul><li>El film de PVC se <strong>precalienta</strong> y se <strong>termoforma</strong> el alvéolo.</li><li>Se <strong>llena</strong> con el producto y se <strong>verifica</strong> (sistema de visión SEA Vision).</li><li>Se <strong>sella</strong> con la lámina de aluminio, se <strong>codifica</strong> y se <strong>corta</strong>.</li><li>Todo <strong>sincronizado por fases</strong> desde el movimiento principal.</li></ul></div></div><div class="io-col io-col--out"><div class="io-col__head">↗ SALIDAS<small>Deseadas y no deseadas</small></div><div class="io-col__body"><ul><li><strong>Máquina reconfigurada al nuevo formato</strong>: Dispositivos sustituidos con las piezas de formato indicadas por su código y reguladores programados con los valores de la ficha técnica del producto.</li><li><strong>Máquina restablecida en funciones normales</strong>: Emergencia rearmada, mando a distancia retirado del cuadro y RESET pulsado.</li><li><strong>Ficha de señalización de Defectos o Anomalías</strong>: Documento que el usuario rellena para comunicar defectos detectados (véase 'Soporte para el usuario', capítulo 1).</li><li><strong>Ficha de Solicitud de Soporte Técnico</strong>: Se rellena y se envía copia a Marchesini Group S.p.A. cuando hay que resolver un problema no contemplado en el manual.</li><li><strong>Blísteres terminados</strong>: Tras el corte/cizallado (M4M65100380) el blíster es tomado por las ventosas del grupo cicloide, expulsado por el expulsor de blíster y transportado por la cinta de salida M4G75102320 hacia la máquina siguiente de la línea.</li><li><strong>Descarte (scarto motorizado)</strong>: La máquina dispone de un dispositivo de descarte motorizado con su propio motor y reductor (referenciado en el mantenimiento del grupo M4M18200910).</li><li><strong>Recorte de película</strong>: Material sobrante de la película tras el cizallado, arrastrado por el rodillo de arrastre de película del grupo M4M65100380.</li><li><strong>Señal de marcha permitida</strong>: Harlequin puede detener la máquina bajando la señal de marcha permitida cuando se presentan ciertas condiciones durante la marcha. La función de Exclusión la levanta para permitir trabajar sin control. La adquisición con trigger la levanta temporalmente.</li><li><strong>Señal de control excluido</strong>: Se envía a la máquina junto con la señal de marcha permitida cuando se activa la Exclusión del control. Con el control excluido todos los blísters son descartados o dejados pasar según lo programado en el campo Estado de las Salidas de la página de Parámetros de Trabajo.</li><li><strong>Señales de salida forzables desde la página Entradas y Salidas</strong>: Cliqueando sobre una de las señales de salida se produce su cambio de estado. Al salir de la ventana de control se restaura la situación preexistente de las señales de salida.</li><li><strong>Señales auxiliares de descarte</strong>: Se identifican por su número y por el mensaje asociado. Se visualizan en la parte derecha de la pantalla junto con las colas de descarte de las telecámaras. Se gestionan desde Programación Artículo → Parámetros → Auxiliares de Descarte.</li><li><strong>Colas de descarte y shift register</strong>: En la parte derecha de la pantalla se muestran las colas de descarte de las telecámaras y de las señales auxiliares de descarte; el shift register del PLC interno, si está habilitado, se muestra en la parte izquierda. El movimiento de los datos es de izquierda a derecha. Si los shift registers son largos, sólo se muestra la parte inicial (introducción de datos) y la parte final (extracción).</li></ul></div></div></div>
              `
            },
            {
              id: "int-estaciones",
              title: "Estaciones de la máquina",
              content: `
<p>Las estaciones de la blistera y qué hace cada una.</p><table class="crit-table"><tbody><tr><th>Estación</th><th>Función</th><th>Ajustes</th></tr><tr><td>Grupo cizalla / placa cizalla (tranciante)</td><td>Corte de los blísteres formados</td><td>Aflojar los tornillos de fijación (1) y extraer la cizalla (2) para verificar el estado de los elementos de cizallado cada H(600). Los márgenes de cizallado no deben presentar irregularidades ni grietas. ¡ATENCIÓN! Evitar que la máquina gire en vacío con la cizalla instalada para no provocar desgaste precoz</td></tr><tr><td>Rodillo de arrastre de película</td><td>Arrastre de la película a lo largo de la máquina</td><td>Control de desgaste cada H(300): no debe presentar grietas ni deformaciones. Limpieza externa cada H(300) con paño y solución detergente ligera, sin disolventes ni gasolinas. Sustitución preventiva del rodillo engomado cada M(6): desmontar la brida (2), quitar la arandela (3), desmontar el puente (4) y desenganchar el motor trasero (5); anotar la fecha de sustitución</td></tr><tr><td>Grupo prepunzones (M4A15401010-1.1)</td><td>Preforma / pretaladra la banda antes de las estaciones siguientes</td><td>Fase verificada por alineación de muescas (1 y 2) en la motorización trasera; restablecimiento aflojando el perno (1) y girando el dispositivo giratorio (2). Mantenimiento: grupo prepunzones (H300, OIL B, pág. 147)</td></tr><tr><td>Grupo unión (empalme) de película de formación (M4A22300630-1.1)</td><td>Empalme del film de formación al agotarse la bobina</td><td>Limpieza y control cada H(600): eliminar restos de film y/o cinta adhesiva de las superficies (1) y de los orificios de aspiración (2); limpiar con paño humedecido en solución detergente natural las superficies (1) en contacto con el film; limpiar la hoja de corte (A) y comprobar su deslizamiento. Limpieza del movimiento de la cortadora cada H(3600): limpiar el eje (1) con pincel y solución detergente natural, limpiar a fondo las dos ranuras laterales (2), secar con paño limpio y NO lubricar. Limpieza de los rodillos de reenvío de película de formación (1) cada H(600)</td></tr><tr><td>Grupo unión (empalme) de película de cobertura (M4A22300720-1.1)</td><td>Empalme del film/aluminio de cobertura</td><td>Limpieza y control cada H(600): eliminar restos de film y/o cinta adhesiva de las superficies (1) y de los orificios de aspiración (2); limpiar las superficies en contacto con el film; limpiar la hoja de corte (A) y comprobar el deslizamiento. Limpieza del movimiento de la cortadora cada H(3600): eje (1) y las dos ranuras laterales (2) con pincel y detergente natural, secar y NO lubricar</td></tr><tr><td>Rodillos desviadores de película (M4A25402820-1.1)</td><td>Desvío y guiado de la película</td><td>Limpieza de la superficie externa de los rodillos desviadores (1) cada H(300) con paño humedecido en detergente neutro y secado con paño seco y limpio</td></tr><tr><td>Rodillos desviadores de película (M4A55102620-1.1)</td><td>Desvío y guiado de la película (segundo grupo)</td><td>Limpieza de la superficie externa de los rodillos desviadores (1) cada H(600) con paño humedecido en detergente neutro y secado con paño seco y limpio</td></tr><tr><td>Estación de control por telecámara / visión (M4A52302020-1.1)</td><td>Inspección óptica del producto mediante telecámara</td><td>Limpieza cada H(300): levantar la campana (1) hasta que se active el bloqueo mecánico (2); aspirar los restos de polvo; con paño suave y limpio limpiar las superficies reflectantes (3), la protección del iluminador inferior y el objetivo de la telecámara (4); al terminar bajar la campana (1) tirando del bloqueo mecánico (2)</td></tr><tr><td>Grupo de perforación (M4A65400160-1.1)</td><td>Perforación/punzonado de la banda de blíster</td><td>Verificación del nivel de aceite cada H(1800) con aceite tipo A (nivel no por debajo de la banda amarilla). Limpieza y lubricación de los engranajes de transmisión (1 y 2) cada H(900) con grasa tipo B, desengrasando con pincel y detergente natural, secando con aire comprimido y lubricando con moderación el perfil dentado. Control del desgaste del perfil dentado cada H(3600): no debe haber dientes rotos ni deformados. Remontaje con alineaciones A y B y regulación de la holgura del engranaje loco con banda de papel fino</td></tr><tr><td>Taza vibratoria de alimentación (M4G06204E10-1.1)</td><td>Alimentación vibratoria del producto</td><td>Control de suspensiones (1) y tacos de goma (2) del dispositivo vibratorio cada H(1800); sustituir las partes deformadas. Control del desgaste de la correa (1) cada H(3600); ante desgaste precoz, verificar el perfil dentado de las poleas antes de montar la correa nueva</td></tr><tr><td>Grupo de alimentación de comprimidos (M4G12107720-1.1)</td><td>Alimentación y dosificación de los comprimidos a los alvéolos</td><td>Control del desgaste de las paletas cada H(300): girar manualmente la estrella de alimentación (1) y comprobar la integridad del perfil de cada paleta (2); si es necesario desmontar la estrella y sustituir las paletas dañadas; comprobar la limpieza y la fijación del sensor de carga mínima (3). Limpieza del dispositivo de arrastre cada H(300): desmontar el grupo tapa/calota (1) de la pared de la máquina y limpiar con brocha y aire comprimido los perfiles de arrastre de paletas (2 y 3)</td></tr><tr><td>Cabeza de alimentación (M4G12400720-2.1)</td><td>Movimiento de las cabezas de alimentación del producto</td><td>Limpieza y lubricación de las guías cada H(600) con grasa tipo O: aflojar los tornillos (1), extraer la pared (2) hacia el exterior, limpiar por detrás las guías (4) de movimiento de cabezas con pincel (3) y solución detergente natural, secar con paño limpio e inyectar grasa con la herramienta adecuada (5) en los dos distribuidores indicados</td></tr><tr><td>Recorrido de alimentación — cepillo giratorio (4.27.5)</td><td>Orientar el producto en el recorrido de alimentación mediante un cepillo giratorio.</td><td>Desmontar el grupo del recorrido de alimentación, limpiar los cepillos (1) con aire comprimido y controlar el desgaste. Sustituir el cepillo cuando las cerdas ya no logren orientar el producto. Frecuencia H (300).</td></tr><tr><td>Recorrido de alimentación — escobillas giratorias, grupo M4G18104820-1.1</td><td>Orientación del producto mediante escobillas giratorias accionadas por correa de transmisión dentada.</td><td>Desmontar el grupo del recorrido de alimentación y las coberturas (1); limpiar las escobillas (2) con aire comprimido y controlar su desgaste. Para sustituirlas, desenroscar los dos pomos (3 y 4) y extraer las escobillas (2). Frecuencia H (300). Correa de transmisión bajo la tapa delantera (1): control cada H (1800).</td></tr><tr><td>Transportador de salida de blísteres — grupo M4G75102320-2.1</td><td>Transportar los blísteres mediante correa dentada con dientes de empuje hacia el robot y el almacén de estuches de la máquina línea abajo.</td><td>Control de desgaste de la correa (1) y de los dientes de empuje (2) cada H (900); control del tensado con excursión máxima de 30 mm cada H (1800), ajustando las tuercas (2 y 3) y los tornillos (4 y 5) simétricamente. Desmontaje y montaje de la correa según procedimientos 4.29.3 y 4.29.4.</td></tr><tr><td>Pared móvil de abertura (4.27.2)</td><td>Pared extraíble con movimiento de abertura, montada sobre ejes que requieren limpieza y engrase.</td><td>Aflojar los tornillos (1) y extraer la pared (2) hacia el exterior; limpiar los ejes (4) con brocha (3) mojada en solución detergente a base natural; secar con paño limpio e inyectar grasa tipo B en los engrasadores indicados. Frecuencia H (3600).</td></tr><tr><td>Grupo cicloide (transferencia / extracción de blíster)</td><td>Toma y transfiere los blísteres cortados mediante ventosas de vacío; el rotor gira sobre un distribuidor de vacío y una leva comanda la extracción del blíster.</td><td>Tensado de cadenas de motorización máx. 15 mm de oscilación (tensores 3 y 4); limpieza de conductos de aspiración con aire comprimido; limpieza del distribuidor de vacío con referencias de fase marcadas; control de desgaste de engranajes internos (2, 3 y 4); leva de mando extractor lubricada con grasa tipo B; par tornillo motor/reductor 6 Nm.</td></tr><tr><td>Ventosas de toma de blíster</td><td>Aspiran y sujetan el blíster durante la toma.</td><td>No deben presentar grietas ni deformaciones. Si hay que sustituir, cambiar SIEMPRE las dos ventosas de cada brazo. Sustitución preventiva de todas las ventosas cada 6 meses, anotando la fecha.</td></tr><tr><td>Transportador / cinta de salida</td><td>Evacua los blísteres hacia la siguiente máquina.</td><td>Cadena de motorización: oscilación máx. 10 mm, ajuste con tensador (2). Correa de motorización de la cinta de salida sin grietas ni deformaciones; al sustituirla controlar el perfil dentado de las poleas.</td></tr><tr><td>Descarte motorizado (scarto motorizzato)</td><td>Expulsa el producto/blíster descartado.</td><td>Par tornillo de acoplamiento motor/reductor: 5 Nm. Remontaje de motor y reductor en vertical.</td></tr><tr><td>Desenrollado y arrastre de la película de formación (M4M25100930-1.1)</td><td>Desbobina y arrastra el film de formación hacia la estación de precalentamiento.</td><td>Limpiar el rodillo (2) con paño y solución detergente ligera; NO usar productos con alcohol ni disolventes. El rodillo no debe presentar grietas ni deformaciones. Sustitución preventiva del rodillo engomado cada 6 meses. Par tornillo motor/reductor: 5 Nm.</td></tr><tr><td>Rodillos de reenvío de la película de formación (M4M25200540-1.1)</td><td>Guían y reenvían el film de formación en su recorrido.</td><td>Limpieza externa con paño y solución detergente ligera cada 300 h; control de desgaste del rodillo de arrastre; sustitución preventiva del rodillo engomado cada 6 meses.</td></tr><tr><td>Estación de precalentamiento (M4M30101640-1.1)</td><td>Calienta el film de formación con placas de precalentamiento antes del formado; el movimiento de las placas se comanda por leva.</td><td>Junta de goma de motorización: distancia mínima 1/2 mm entre semijuntas, sin juego. Leva de mando lubricada con grasa tipo B (H 900). Guía de deslizamiento de las placas: limpiar cada 600 h y NO lubricar. Limpieza de placas cada 300 h con paño humedecido en agua caliente, sin espátulas ni herramientas. Verificación de termorreguladores con sonda en los tornillos especiales (4 y 5) tras 10 minutos de estabilización.</td></tr><tr><td>Estación de formado / matriz (M4M35101810-2.1)</td><td>Forma los alveolos en el film precalentado mediante placas de moldeado.</td><td>Lubricar los tres engrasadores de los movimientos de matriz con grasa tipo B cada 300 h (máquina parada con pulsador de paro). Desmontar y limpiar las placas de moldeado (1 y 2) cada 300 h, sin herramientas metálicas, comprobando integridad de perfiles y superficies. Junta elástica: marca '5' hacia el lado reductor. Reductor: comprobar visualmente el sello de aceite cada 600 h.</td></tr><tr><td>Rodillo enrasador / cepillo de alimentación (M4M50102820-1.1)</td><td>Enrasa el producto en los alveolos tras el llenado.</td><td>Desmontar el cepillo (1) del soporte y lavarlo con agua corriente cada 600 h; no debe presentar cerdas deformadas o rotas; sustituir si es necesario.</td></tr><tr><td>Estación de sellado / soldadura (M4M60101840-2.1)</td><td>Sella el film de cobertura (aluminio) sobre el film formado mediante placas soldadoras calefactadas; incorpora pinzas y carro con guías.</td><td>Lubricación de movimientos anteriores con grasa en los engrasadores (4, 5 y 6) cada 600 h; guía trasera limpiada y engrasada cada 600 h; guía de deslizamiento con grasa tipo O en el engrasador (2) cada 900 h, sin lubricar la guía directamente. Limpieza de placas soldadoras (inferior y superior) cada 300 h con paño humedecido en agua caliente; el cepillo metálico en dotación SOLO se admite en la placa superior. Tacos de agarre del film: sustitución preventiva cada 6 meses. Par motor/reductor pinzas 5 Nm; par motor/reductor carro 35 Nm. Termorregulador verificado con sonda en el punto (2) tras 10 minutos.</td></tr><tr><td>Transporte embragado / frizionato (M4M62101220-1.1)</td><td>Arrastra la banda de blíster mediante rodillos de transporte con embrague.</td><td>Limpiar la superficie externa de los rodillos (2) con paño y solución detergente ligera cada 300 h. Prohibido el uso de disolventes y/o gasolinas.</td></tr><tr><td>Estación de codificación y cizallado/corte (M4M65100380-1.1)</td><td>Imprime/graba el código en la banda y realiza el troquelado-corte del blíster; accionada por una caja mecánica con baño de aceite.</td><td>Nivel de aceite en la banda amarilla (1), aceite tipo A, control entre 5 y 30 minutos tras el apagado, cambio cada 900 h con recipiente de unos 4 litros. Punzones de codificación: aflojar bornes (1), extraer cabezas (2 y 3) y comprobar desgaste cada 600 h.</td></tr><tr><td>Grupo cicloide / tambor cicloide (M4M18200910)</td><td>Movimiento cicloidal que toma y transporta el blíster mediante brazos portaventosas y ventosas; incluye el expulsor de blíster accionado por leva y la motorización del transportador de salida.</td><td>Fase del tambor cicloide por alineación de muescas coloreadas girando el disco del cicloide; posición de ventosas mediante volante manual, nivel y giro del piñón central; fase del expulsor de blíster girando la leva hasta alinear muescas.</td></tr><tr><td>Desbobinado / desenrollado de la película de formación (M4M25100930)</td><td>Desenrolla y alimenta la película de formación hacia la máquina mediante el rodillo de desenrollado.</td><td>Puesta a cero del índice para anchura de la película de formación (contrastes laterales a final de carrera, secuencia 9990 → 0000).</td></tr><tr><td>Rodillos de reenvío de la película de formación (M4M25200540)</td><td>Guían y reenvían la película de formación hacia la estación de precalentamiento.</td><td>Reguladores numéricos: puesta a cero por tope mecánico y secuencia 9990 → 0000 (partes 1 y 2), restableciendo luego el valor del formato en trabajo.</td></tr><tr><td>Estación de precalentamiento (M4M30101640)</td><td>Precalienta la película de formación mediante dos placas calefactadas antes de la estación de formación</td><td>Paralelismo: saliente de cada taco de apoyo 0,2 mm y separación entre las dos placas 0,4 mm en cada punto de apoyo, corregible con espesores cód. C010010804. Mantenimiento: limpieza de placas (H300, ficha pág. 105), limpieza de guías (H600, pág. 104), limpieza y lubricación del movimiento de placas (H900, OIL B, pág. 103), control de eficiencia de los termorreguladores (H1800, pág. 106) y control de ajuste de junta (H1800, pág. 107)</td></tr><tr><td>Estación de formación / formado (M4M35101810)</td><td>Forma los alvéolos del blíster en la película de formación mediante la matriz y las placas de formación.</td><td>Comprobación y restablecimiento de la fase de la estación de formación (págs. 37 y 38 del manual).</td></tr><tr><td>Enrasador (M4M50102820 y M4G12400720)</td><td>Rodillo enrasador que nivela / retira el producto sobrante sobre los alvéolos tras la alimentación.</td><td>Puesta a cero del índice de altura del enrasador (págs. 39 y 46 del manual).</td></tr><tr><td>Estación de soldadura / sellado (M4M60101840)</td><td>Suelda la película de cobertura sobre la película de formación mediante las placas de soldadura, con carro y pinzas motorizadas.</td><td>Comprobación y restablecimiento de la fase de la estación de soldadura (págs. 40 y 41 del manual); termorregulador de soldadura.</td></tr><tr><td>Transporte embragado (M4M62101220)</td><td>Rodillos de transporte embragado (frizionato) de la banda.</td><td>No detallado en este bloque.</td></tr><tr><td>Estación de codificación y cizallado / cortador (M4M65100380)</td><td>Codifica (punzones de codificación) y corta / troquela el blíster; incluye el rodillo de arrastre de la película y la caja de codificación y cizallado con aceite.</td><td>Verificación y restablecimiento de la fase del cortador (págs. 42 y 43 del manual). Es la PRIMERA ficha de la secuencia de puesta en fase de los movimientos principales.</td></tr><tr><td>Grupo prepunzones (M4A15401010)</td><td>Prepunzonado del blíster.</td><td>Control y restablecimiento del grupo prepunzones (págs. 44 y 45 del manual).</td></tr><tr><td>Grupo de unión / empalme de la película de formación (M4A22300630)</td><td>Empalme automático de la bobina de película de formación, con cortadora.</td><td>No detallado en este bloque.</td></tr><tr><td>Grupo de unión / empalme de la película de cobertura (M4A22300720)</td><td>Empalme automático de la bobina de película de cobertura (aluminio), con cortadora.</td><td>No detallado en este bloque.</td></tr></tbody></table>
              `
            },
            {
              id: "int-calibraciones",
              title: "Calibraciones y fases (verificación y restablecimiento)",
              content: `
<p><span class="src-tag src-manual">MANUAL DE CALIBRADO</span> Procedimientos de <strong>verificación y restablecimiento de fase</strong>, puesta a cero de índices y paralelismos. Son los ajustes que devuelven la máquina a su sincronía correcta.</p><div class="alert-box">⚠ Antes de calibrar: máquina en <strong>condiciones de seguridad operativa</strong> según el manual, y usa el <strong>utillaje/galgas (DIME)</strong> indicado. Las fases se verifican en la secuencia de los movimientos principales.</div><div class="step-card"><div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">Uso de MUESCAS DE REFERENCIA (tacche di riferimento)</span></div><div class="step-card__row"><span>Estación</span><span>Toda la máquina (dispositivos de precisión NO micrométrica)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Se emplean por regla general como puntos de referencia fijos para desmontajes y remontajes. A veces se utilizan como referencia para regulaciones de sincronización (fase) o de cambio de formato. Deben utilizarse con atención procurando que los puntos marcados coincidan correctamente entre sí.</span></div><div class="step-card__row"><span>Herramienta</span><span>Ninguna (marcas grabadas en la máquina)</span></div><div class="step-card__params"><strong>Valores:</strong> Sin valor numérico: coincidencia de marcas · manual pág. 17</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">Uso de GALGAS DE REFERENCIA (DIME) para calibrados</span></div><div class="step-card__row"><span>Estación</span><span>Toda la máquina (donde la descripción lo exija)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Atenerse escrupulosamente a lo indicado en cada operación concreta. Puede haber más de una galga y a veces la misma galga sirve para más de una regulación. Cuando la instalación necesita GALGAS, éstas se suministran con la propia máquina y van codificadas; la codificación se indica en cada descripción que las utiliza.</span></div><div class="step-card__row"><span>Herramienta</span><span>GALGAS (DIME) codificadas suministradas en dotación con la máquina</span></div><div class="step-card__params"><strong>Valores:</strong> Codificación de cada galga indicada en la descripción de la operación correspondiente · manual pág. 17</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">Regulación de REGULADORES NUMÉRICOS y POMOS - Método A (paso a un valor SUPERIOR)</span></div><div class="step-card__row"><span>Estación</span><span>Grupos de máquina que requieren regulaciones exactas y/o frecuentes</span></div><div class="step-card__row"><span>Procedimiento</span><span>ÚNICA OPERACIÓN: rotación HORARIA del control directamente hasta el nuevo valor.</span></div><div class="step-card__row"><span>Herramienta</span><span>Regulador numérico / pomo de regulación; valor tomado de la ficha técnica de planteamiento</span></div><div class="step-card__params"><strong>Valores:</strong> Ejemplo: valor actual = 100, nuevo valor = 150 -> girar en sentido horario hasta 150 · manual pág. 18</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">Regulación de REGULADORES NUMÉRICOS y POMOS - Método B (paso a un valor INFERIOR)</span></div><div class="step-card__row"><span>Estación</span><span>Grupos de máquina que requieren regulaciones exactas y/o frecuentes</span></div><div class="step-card__row"><span>Procedimiento</span><span>DOS OPERACIONES: 1) rotación ANTIHORARIA del control hasta pasarse por debajo del nuevo valor; 2) rotación HORARIA del control hasta el nuevo valor. Se aproxima siempre desde abajo en sentido horario para eliminar el juego.</span></div><div class="step-card__row"><span>Herramienta</span><span>Regulador numérico / pomo de regulación; valor tomado de la ficha técnica de planteamiento</span></div><div class="step-card__params"><strong>Valores:</strong> Ejemplo: valor actual = 100, nuevo valor = 40 -> girar antihorario hasta 35, luego horario hasta 40 (es decir, pasarse 5 unidades por debajo y recuperar en horario) · manual pág. 18</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">Uso de HERRAMIENTAS DE MEDICIÓN para calibrados especiales</span></div><div class="step-card__row"><span>Estación</span><span>Puntos con condiciones de instalación específicas</span></div><div class="step-card__row"><span>Procedimiento</span><span>Asegurarse de que las mediciones se efectúen EN EJE con los puntos de referencia indicados y no modificar bajo ningún concepto las partes que forman parte de esas referencias.</span></div><div class="step-card__row"><span>Herramienta</span><span>Herramientas de medición en dotación</span></div><div class="step-card__params"><strong>Valores:</strong> Según la operación · manual pág. 16</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">Verificación previa de las sincronizaciones (fases) de la instalación</span></div><div class="step-card__row"><span>Estación</span><span>Toda la instalación</span></div><div class="step-card__row"><span>Procedimiento</span><span>Antes de efectuar cualquier modificación, y especialmente si hay defectos, controlar las fases/sincronizaciones de la instalación además del estado del mantenimiento preventivo.</span></div><div class="step-card__row"><span>Herramienta</span><span>Documentación de fases de la máquina</span></div><div class="step-card__params"><strong>Valores:</strong> Los valores de fase están en el manual 'Sincronización de la instalación' (Fasature sull'impianto), no en este fascículo · manual pág. 13</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">Secuencia de montaje de los engranajes del grupo de perforación (alineaciones A y B)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo de perforación / punzonado (M4A65400160-1.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Girar el volante manual del grupo de corte hasta alcanzar simultáneamente las condiciones de alineación A y B. Aflojar los tornillos (1) y alejar el engranaje loco (2). Al montar un engranaje nuevo y/o al volver a posicionar el engranaje loco (2), comprobar con atención las alineaciones A y B. Para regular la altura del engranaje loco (2), seguir el procedimiento de regulación de holgura.</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante manual del grupo de corte (tranciante); llave para tornillos (1)</span></div><div class="step-card__params"><strong>Valores:</strong> Condiciones de alineación A y B deben cumplirse simultáneamente · manual pág. 169</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">Regulación de la holgura (juego) del engranaje loco del grupo de perforación</span></div><div class="step-card__row"><span>Estación</span><span>Grupo de perforación / punzonado (M4A65400160-1.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Después de una primera regulación de la altura del engranaje loco (1), intercalar una banda entera de papel fino (A) entre los engranajes (1 y 2) y apretar los tornillos (3). Con el volante manual, hacer girar el grupo hasta expulsar la banda de papel recién introducida. Si el papel presenta desgarros o roturas en los puntos deformados por el engrane, significa que los engranajes no tienen holgura y hay que alejarlos 'ligeramente'. Repetir hasta obtener la holgura mínima posible. ¡ATENCIÓN! Durante la regulación comprobar siempre que se mantengan las alineaciones A y B.</span></div><div class="step-card__row"><span>Herramienta</span><span>Banda de papel fino en buen estado (galga de papel), volante manual, llave para los tornillos (3)</span></div><div class="step-card__params"><strong>Valores:</strong> La holgura debe ser siempre la mínima posible; el papel no debe romperse ni desgarrarse al ser expulsado · manual pág. 170</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">Verificación del nivel de aceite de la caja de perforación</span></div><div class="step-card__row"><span>Estación</span><span>Caja de perforación (M4A65400160-1.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Controlar que el nivel del aceite no descienda por debajo de la banda amarilla (1). La verificación debe efectuarse con la máquina parada desde hace al menos 5 minutos y sin exceder los 30 minutos desde el apagado. Para un simple relleno, quitar la tapa (A). En mantenimiento extraordinario: preparar un recipiente de capacidad adecuada (unos 4 litros), desenroscar el tapón de descarga de aceite (2), vaciar todo el aceite, volver a enroscar el tapón (2) y rellenar con aceite tipo A sin rebasar la banda amarilla (1).</span></div><div class="step-card__row"><span>Herramienta</span><span>Recipiente de recogida (~4 litros), aceite tipo A</span></div><div class="step-card__params"><strong>Valores:</strong> Frecuencia H(1800); aceite tipo A; espera 5 min mínimo y 30 min máximo tras el apagado; recipiente de recogida de aproximadamente 4 litros; nivel entre el mínimo y la banda amarilla (1) · manual pág. 166</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">10</span><span class="step-card__title">Control de la alineación y fijación de fotocélulas y espejos catadióptricos</span></div><div class="step-card__row"><span>Estación</span><span>Armario eléctrico y componentes de campo (M4M96101410-1.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Comprobar la fijación mecánica, la alineación y el cableado de las fotocélulas y de sus correspondientes espejos catadióptricos. Comprobar la fijación mecánica de las electroválvulas (1) y de los motores eléctricos (2). Comprobar el apretado de todos los pasacables (3).</span></div><div class="step-card__row"><span>Herramienta</span><span>Herramienta de apriete estándar</span></div><div class="step-card__params"><strong>Valores:</strong> Frecuencia H(600) · manual pág. 154</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">11</span><span class="step-card__title">Sincronización (rifasamento) previa al desmontaje de la correa de transporte de blísteres</span></div><div class="step-card__row"><span>Estación</span><span>Transporte / salida de blísteres — grupo M4G75102320-2.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Efectuar la SINCRONIZACIÓN. Al finalizar la sincronización, con el diente del blíster (1) y las marcas (2 y 3) indicadas en la figura alineados, parar la máquina con el pulsador de STOP. Después desmontar los revestimientos (4 y 5). Es el punto de partida obligatorio del procedimiento 4.29.3 de desmontaje de la correa.</span></div><div class="step-card__row"><span>Herramienta</span><span>Pulsador de STOP de la máquina</span></div><div class="step-card__params"><strong>Valores:</strong> Condición de parada: diente del blíster (1) alineado con las marcas de referencia (2 y 3) · manual pág. 184</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">12</span><span class="step-card__title">Control del tensado de la correa de transporte (4.29.2)</span></div><div class="step-card__row"><span>Estación</span><span>Transportador de blísteres — grupo M4G75102320-2.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Comprobar la excursión de la correa (1) del transportador en el punto indicado, presionando como ilustra la figura sin exceder con la carga. Si la excursión rebasa el límite, aflojar las tuercas (2 y 3) e intervenir simétricamente en los tornillos (4 y 5) en la medida apenas suficiente para eliminar el desplazamiento excesivo. Al terminar las operaciones, volver a apretar las tuercas (2 y 3).</span></div><div class="step-card__row"><span>Herramienta</span><span>Llaves para las tuercas (2 y 3) y para los tornillos de tensado (4 y 5)</span></div><div class="step-card__params"><strong>Valores:</strong> Excursión máxima admitida: 30 mm (no debe rebasar los 30 milímetros). Frecuencia H (1800) · manual pág. 183</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">13</span><span class="step-card__title">Comprobación del apretado del tornillo de acoplamiento motor-reductor (4.27.4)</span></div><div class="step-card__row"><span>Estación</span><span>Grupos motorizados (motor / reductor)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Quitar el tapón (1) y, con la ayuda de una llave dinamométrica calibrada, comprobar el apretado del tornillo interno (2) de acoplamiento motor / reductor.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica calibrada a 11 Nm</span></div><div class="step-card__params"><strong>Valores:</strong> Par de apriete: 11 Nm. Frecuencia H (1200) · manual pág. 178</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">14</span><span class="step-card__title">Alineación en el remontaje de motor y reductor (4.27.3)</span></div><div class="step-card__row"><span>Estación</span><span>Grupos motorizados (motor / reductor)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Cuando sea necesario volver a montar el motor (1) y/o el reductor (2), se aconseja realizar el ensamblaje VERTICALMENTE para optimizar la alineación entre las partes en movimiento.</span></div><div class="step-card__row"><span>Herramienta</span><span>No indicado en el manual</span></div><div class="step-card__params"><strong>Valores:</strong> Ensamblaje en posición vertical (el manual no da cota numérica) · manual pág. 177</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">15</span><span class="step-card__title">Verificación de la condición de la figura A antes de introducir el rodillo (4.29.4)</span></div><div class="step-card__row"><span>Estación</span><span>Transportador de blísteres — grupo M4G75102320-2.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Para completar el procedimiento de montaje de la correa nueva, efectuar la secuencia de desmontaje en orden contrario y comprobar que se cumplan las condiciones ilustradas en la figura A ANTES de introducir el rodillo (5).</span></div><div class="step-card__row"><span>Herramienta</span><span>No indicado en el manual</span></div><div class="step-card__params"><strong>Valores:</strong> Verificación previa obligatoria antes de montar el rodillo (5) · manual pág. 197</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">16</span><span class="step-card__title">Control del tensado de las cadenas de movimiento cicloide (4.5.2)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo cicloide (transferencia de blíster)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Comprobar en el punto indicado el grado de tensado de las cadenas (1 y 2) de motorización del cicloide, como ilustra la figura y sin exceder con la carga. Intervenir con los tensores de cadena (3 y 4) en la medida justa para eliminar la excursión excesiva.</span></div><div class="step-card__row"><span>Herramienta</span><span>Tensores de cadena (3 y 4)</span></div><div class="step-card__params"><strong>Valores:</strong> Oscilación máxima admitida: 15 mm. Frecuencia H (1800 h) · manual pág. 91</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">17</span><span class="step-card__title">Comprobación del tensado de la cadena de motorización del transportador de salida (4.5.3)</span></div><div class="step-card__row"><span>Estación</span><span>Transportador de salida</span></div><div class="step-card__row"><span>Procedimiento</span><span>Comprobar en el punto indicado el grado de tensado de la cadena (1) de motorización del transportador de salida, sin exceder con la carga. Intervenir en el tensador de cadena (2) lo justo para eliminar la excursión excesiva.</span></div><div class="step-card__row"><span>Herramienta</span><span>Tensador de cadena (2)</span></div><div class="step-card__params"><strong>Valores:</strong> Oscilación máxima admitida: 10 mm. Frecuencia H (1800 h) · manual pág. 92</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">18</span><span class="step-card__title">Referencias de fase rotor / distribuidor de vacío antes del desmontaje (4.5.5)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo cicloide - distribuidor de vacío</span></div><div class="step-card__row"><span>Procedimiento</span><span>Antes de desmontar, con un lápiz dibujar (si faltan) las referencias de fase entre el rotor (1) y el distribuidor de vacío (2). Desmontar la placa delantera (3) y aplicar muescas de fase (4) a lo largo del perfil dentado de los engranajes (5 y 6). Después desmontar el engranaje (6) y sacar el rotor del cicloide (7). Limpiar con aire comprimido la superficie externa del distribuidor de vacío (8). Las marcas permiten restablecer la fase al remontar.</span></div><div class="step-card__row"><span>Herramienta</span><span>Lápiz de trazar, aire comprimido</span></div><div class="step-card__params"><strong>Valores:</strong> Frecuencia H (1800 h) · manual pág. 94</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">19</span><span class="step-card__title">Remontaje motor y reductor - alineación (4.5.8 / 4.5.13 / 4.6.4 / 4.11.4 / 4.11.6)</span></div><div class="step-card__row"><span>Estación</span><span>Varias motorizaciones (cicloide, descarte motorizado, desenrollado film de formación, grupo soldadura)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Al volver a montar el motor (1) y/o el reductor (2), realizar el ensamblaje en posición VERTICAL para optimizar la alineación entre las partes en movimiento. Consultar la documentación técnica del proveedor para los controles y revisiones periódicas.</span></div><div class="step-card__row"><span>Herramienta</span><span>Documentación técnica del proveedor</span></div><div class="step-card__params"><strong>Valores:</strong> Sin valor numérico indicado · manual pág. 97, 102, 107, 126, 128</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">20</span><span class="step-card__title">Comprobación del apretado del tornillo de acoplamiento motor-reductor (cicloide) (4.5.9)</span></div><div class="step-card__row"><span>Estación</span><span>Motorización cicloide</span></div><div class="step-card__row"><span>Procedimiento</span><span>Quitar el tapón (1) y con llave dinamométrica calibrada comprobar el apretado del tornillo interno (2) de acoplamiento motor / reductor.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica tarada a 6 Nm</span></div><div class="step-card__params"><strong>Valores:</strong> Par: 6 Nm. Frecuencia H (1200 h) · manual pág. 98</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">21</span><span class="step-card__title">Control del apretado del tornillo de acoplamiento motor-reductor (descarte motorizado) (4.5.14)</span></div><div class="step-card__row"><span>Estación</span><span>Descarte motorizado</span></div><div class="step-card__row"><span>Procedimiento</span><span>Quitar el tapón (1) y con llave dinamométrica comprobar el apretado del tornillo (2) de acoplamiento motor / reductor.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica tarada a 5 Nm</span></div><div class="step-card__params"><strong>Valores:</strong> Par: 5 Nm. Frecuencia H (1200 h) · manual pág. 103</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">22</span><span class="step-card__title">Comprobación apretado tornillo de acoplamiento motor-reductor (desenrollado film de formación) (4.6.5)</span></div><div class="step-card__row"><span>Estación</span><span>Desenrollado / arrastre película de formación (M4M25100930-1.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Quitar el tapón (1) y con llave dinamométrica comprobar el apretado del tornillo (2) de acoplamiento motor / reductor.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica tarada a 5 Nm</span></div><div class="step-card__params"><strong>Valores:</strong> Par: 5 Nm. Frecuencia H (1200 h) · manual pág. 108</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">23</span><span class="step-card__title">Control del desgaste del acoplamiento (junta) de goma - distancia entre semijuntas (4.8.1)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo precalentamiento (M4M30101640-1.1) - junta elástica de motorización</span></div><div class="step-card__row"><span>Procedimiento</span><span>Girar manualmente en sentido contrario las dos semijuntas (1 y 2) y comprobar la ausencia de juego del acoplamiento central de goma (3). Si hay juego excesivo con aplastamiento del acoplamiento, sustituirlo.</span></div><div class="step-card__row"><span>Herramienta</span><span>Comprobación manual</span></div><div class="step-card__params"><strong>Valores:</strong> ATENCIÓN: mantener una distancia mínima de 1 / 2 mm entre las dos semijuntas (1 y 2). Frecuencia H (1800 h) · manual pág. 112</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">24</span><span class="step-card__title">Control de eficiencia de los termorreguladores de precalentamiento (4.8.5)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de precalentamiento (placas de precalentamiento)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Dar tensión a la máquina y ponerla en modalidad “Producción Normal”. En el display seleccionar en los termorreguladores de precalentamiento la temperatura de trabajo correspondiente a la ficha de formato (1) configurada. Cuando los termorreguladores alcancen la temperatura programada, esperar al menos 10 minutos, abrir las placas de precalentamiento (2 y 3) e introducir la sonda de control en los tornillos especiales (4 y 5). Controlar también los puntos indicados de la placa (3). Si no se alcanza la temperatura programada para el formato, controlar las conexiones del esquema eléctrico.</span></div><div class="step-card__row"><span>Herramienta</span><span>Sonda de temperatura de verificación (se introduce en los tornillos especiales 4 y 5)</span></div><div class="step-card__params"><strong>Valores:</strong> Espera mínima tras alcanzar consigna: 10 minutos. Temperatura según ficha de formato. Frecuencia H (1800 h) · manual pág. 116</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">25</span><span class="step-card__title">Control del ajuste de la junta elástica motor (precalentamiento) (4.8.6)</span></div><div class="step-card__row"><span>Estación</span><span>Motorización placas de precalentamiento</span></div><div class="step-card__row"><span>Procedimiento</span><span>En caso de sustitución o desmontaje del motor (1), introducir la junta elástica (A) en el árbol motor llevándola a tope mecánico (B) y apretar a fondo el tornillo de fijación (2) con llave dinamométrica calibrada al valor indicado en la figura.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica</span></div><div class="step-card__params"><strong>Valores:</strong> Par: el indicado en la figura del manual (no transcrito en el texto). Frecuencia H (1800 h) · manual pág. 117</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">26</span><span class="step-card__title">Control del ajuste de la junta elástica motor - estación de formado (4.9.3)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de formado / matriz (M4M35101810-2.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>En caso de sustitución o desmontaje del motor (1), introducir la junta elástica (A) en el árbol motor llevándola a tope mecánico (B) y apretar a fondo el tornillo de fijación (2) con llave dinamométrica calibrada al valor indicado en la figura. Lubricar ligeramente los dientes y los alojamientos del elemento elástico (A). El número '5' grabado dentro del elemento elástico (A) debe quedar dirigido hacia el lado del reductor (3). Alinear verticalmente un diente de la junta lado motor con un alojamiento de la junta lado reductor. Al terminar, introducir el motor (1) y apretar a fondo los tornillos en la brida.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica; grasa para dientes del elemento elástico</span></div><div class="step-card__params"><strong>Valores:</strong> Orientación: marca '5' del elemento elástico hacia el lado reductor (3). Alineación vertical diente-alojamiento. Par según figura. · manual pág. 120</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">27</span><span class="step-card__title">Control del apretado de tornillos de acoplamiento motor-reductor (motorización pinzas) (4.11.3)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo soldadura - motorización pinzas (M4M60101840-2.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Quitar el tapón (1) y con llave dinamométrica comprobar el apretado del tornillo interno de acoplamiento motor / reductor (2 / 3).</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica tarada a 5 Nm</span></div><div class="step-card__params"><strong>Valores:</strong> Par: 5 Nm. Frecuencia H (1200 h) · manual pág. 125</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">28</span><span class="step-card__title">Control del apretado de tornillos de acoplamiento motor-reductor (motorización carro) (4.11.5)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo soldadura - motorización carro</span></div><div class="step-card__row"><span>Procedimiento</span><span>Quitar el tapón (1) y con llave dinamométrica comprobar el apretado del tornillo (2) de acoplamiento motor / reductor.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave dinamométrica tarada a 35 Nm</span></div><div class="step-card__params"><strong>Valores:</strong> Par: 35 Nm. Frecuencia H (1200 h) · manual pág. 127</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">29</span><span class="step-card__title">Control de eficiencia del termorregulador de soldadura (4.11.10)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de sellado / soldadura</span></div><div class="step-card__row"><span>Procedimiento</span><span>Dar tensión a la máquina y ponerla en “Producción Normal”. En el display seleccionar en el termorregulador de sellado la temperatura de trabajo correspondiente a la ficha de formato (1) configurada; se puede controlar y modificar en el menú ESTADOS MÁQUINA --> TEMPERATURAS. Cuando el termorregulador alcance la temperatura programada, esperar al menos 10 minutos e introducir la sonda de control en el punto indicado (2).</span></div><div class="step-card__row"><span>Herramienta</span><span>Sonda de temperatura de verificación</span></div><div class="step-card__params"><strong>Valores:</strong> Espera mínima tras alcanzar consigna: 10 minutos. Temperatura según ficha de formato. Frecuencia H (1800 h) · manual pág. 132</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">30</span><span class="step-card__title">Control del nivel de aceite de la caja de codificación y cizallado (4.13.1)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de codificación y corte/cizallado (M4M65100380-1.1)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Controlar que el nivel de aceite no descienda por debajo de la banda amarilla (1). El control se hace con la máquina parada desde hace al menos 5 minutos y sin superar los 30 minutos desde el apagado. Para llenado simple, quitar la tapa (A).</span></div><div class="step-card__row"><span>Herramienta</span><span>Aceite tipo A; tapa (A) de llenado</span></div><div class="step-card__params"><strong>Valores:</strong> Nivel: no por debajo ni por encima de la banda amarilla (1). Ventana de medición: entre 5 y 30 minutos tras el apagado. Aceite tipo A. Frecuencia H (900 h) · manual pág. 134</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">31</span><span class="step-card__title">Secuencia de los controles sobre la puesta en fase (movimientos principales)</span></div><div class="step-card__row"><span>Estación</span><span>Motorización principal (toda la máquina)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Secuencia OBLIGATORIA que debe seguirse para un control esmerado o una puesta en fase completa de toda la motorización principal. Consultar SOLO la ficha cuya página aparece en la última columna y respetar escrupulosamente el orden; de lo contrario no se podrá restablecer correctamente el funcionamiento de la máquina. Orden: 1) M4M65100380 VERIFICACIÓN FASE CORTADOR (pág. 42 del manual); 2) M4M18200910 CONTROL FASE TAMBOR CICLOIDE (pág. 24); 3) M4M18200910 CONTROL DE LA POSICIÓN VENTOSAS (pág. 26); 4) M4M18200910 CONTROL FASE EXPULSOR BLISTER (pág. 28); 5) M4G75102320 COMPROBACIÓN FASE CINTA DE SALIDA (pág. 48); 6) M4M60101840 COMPROBACIÓN FASE ESTACIÓN DE SOLDADURA (pág. 40); 7) M4M35101810 COMPROBACIÓN FASE ESTACIÓN DE FORMACIÓN (pág. 37); 8) M4M30101640 CONTROL FASE ESTACIÓN DE PRECALENTAMIENTO (pág. 33).</span></div><div class="step-card__row"><span>Herramienta</span><span>Fichas de fase del capítulo 3 + esquemas de localización</span></div><div class="step-card__params"><strong>Valores:</strong> Páginas del manual: cortador 42, tambor cicloide 24, ventosas 26, expulsor blíster 28, cinta de salida 48, soldadura 40, formación 37, precalentamiento 33 · manual pág. 28</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">32</span><span class="step-card__title">CONTROL FASE TAMBOR CICLOIDE (3.3.1)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo cicloide / tambor cicloide - M4M18200910-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>A través del display realizar la PUESTA EN FASE (rifasamento). Al terminar la puesta en fase, las muescas coloreadas (1 y 2) deben estar alineadas. Si no lo están, aplicar el procedimiento de restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Display (función PUESTA EN FASE); muescas coloreadas de referencia</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas coloreadas 1 y 2 alineadas · manual pág. 34</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">33</span><span class="step-card__title">RESTABLECIMIENTO DE LA FASE TAMBOR CICLOIDE (3.3.2)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo cicloide / tambor cicloide - M4M18200910-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>A través del display realizar la PUESTA EN FASE. Aflojar los tornillos (1), luego girar el disco (2) del cicloide hasta alinear las muescas (3 y 4). Apretar los tornillos (1).</span></div><div class="step-card__row"><span>Herramienta</span><span>Display; llaves para tornillos (1) del disco cicloide</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas 3 y 4 alineadas · manual pág. 35</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">34</span><span class="step-card__title">CONTROL DE LA POSICIÓN VENTOSAS (3.3.3)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo cicloide - brazos portaventosas - M4M18200910-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Con el volante manual (1) y con la ayuda de un NIVEL (2), colocar los ejes (3) de rotación de las ventosas en la posición ilustrada en la figura. Sin moverse de esa posición, comprobar que las ventosas (4) queden alineadas como en la figura (C). De lo contrario, aplicar el restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante manual; nivel (livella)</span></div><div class="step-card__params"><strong>Valores:</strong> Ejes de rotación de ventosas nivelados; ventosas (4) en línea según figura (C) · manual pág. 36</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">35</span><span class="step-card__title">RESTABLECIMIENTO DE LA POSICIÓN VENTOSAS (3.3.4)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo cicloide - brazos portaventosas - M4M18200910-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Con el volante manual (1) y con la ayuda de un nivel (2), colocar los ejes (3) de rotación de las ventosas alineados como en la figura. Quitar los tornillos (4), sacar los brazos portaventosas (5), desmontar la placa del cicloide (6) y volver a montar los brazos portaventosas (5). Aflojar los tornillos (7) y girar el piñón central (8) hasta volver a colocar las ventosas (9) en la posición correcta. Apretar los tornillos (7) y montar de nuevo la placa (6).</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante manual; nivel; llaves para tornillos (4) y (7)</span></div><div class="step-card__params"><strong>Valores:</strong> Ventosas (9) en la posición correcta según figura · manual pág. 37</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">36</span><span class="step-card__title">CONTROL FASE EXPULSOR BLISTER (3.3.5)</span></div><div class="step-card__row"><span>Estación</span><span>Expulsor de blíster (grupo cicloide) - M4M18200910-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>A través del display realizar la PUESTA EN FASE. Al terminar la puesta en fase, las muescas coloreadas (1 y 2) deben estar alineadas. Si no lo están, aplicar el restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Display (función PUESTA EN FASE)</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas coloreadas 1 y 2 alineadas · manual pág. 38</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">37</span><span class="step-card__title">RESTABLECIMIENTO DE LA FASE EXPULSOR BLISTER (3.3.6)</span></div><div class="step-card__row"><span>Estación</span><span>Expulsor de blíster (grupo cicloide) - M4M18200910-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>A través del display realizar la PUESTA EN FASE. Al terminar la puesta en fase, aflojar los tornillos (1), luego girar la LEVA (2) hasta alinear las muescas (3 y 4). Apretar los tornillos (1).</span></div><div class="step-card__row"><span>Herramienta</span><span>Display; llaves para los tornillos (1) de la leva</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas 3 y 4 alineadas · manual pág. 39</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">38</span><span class="step-card__title">PUESTA A CERO DEL ÍNDICE PARA ANCHURA PELÍCULA DE FORMACIÓN (3.4.1)</span></div><div class="step-card__row"><span>Estación</span><span>Desbobinado / desenrollado de la película de formación - M4M25100930-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Acoplar el volante en el índice (1) y girarlo hasta colocar los contrastes laterales (2 y 3) a final de carrera en el sentido que indica la flecha. Aflojar el perno/prisionero (4) presente en el collar (5) y girar este último hasta alcanzar el valor "9990" (6). Ahora girar en sentido opuesto hasta alcanzar el valor "0000" (6). Apretar el perno de acoplamiento (4).</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante manual; llave allen para el perno (4) del collar (5)</span></div><div class="step-card__params"><strong>Valores:</strong> Secuencia de puesta a cero: "9990" → "0000" · manual pág. 40</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">39</span><span class="step-card__title">REGULADORES NUMÉRICOS - puesta a cero (parte 1) (3.5.1.1)</span></div><div class="step-card__row"><span>Estación</span><span>Rodillos de reenvío de la película de formación - M4M25200540-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Llevar a tope mecánico en el sentido indicado por la flecha o alinear tal como indica la figura. Aflojar el perno (1). Girar el collar (2) hasta ver el valor "9990" en el dispositivo de lectura (3). Girar el collar (2) hasta aumentar el valor a "0000" en el dispositivo de lectura (3). Al terminar la operación, apretar el perno (1) y restablecer el valor correspondiente al formato en trabajo.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno (1); dispositivo de lectura numérico (3)</span></div><div class="step-card__params"><strong>Valores:</strong> "9990" → "0000"; después restablecer el valor del formato en producción · manual pág. 41</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">40</span><span class="step-card__title">REGULADORES NUMÉRICOS - puesta a cero (parte 2) (3.5.1.2)</span></div><div class="step-card__row"><span>Estación</span><span>Rodillos de reenvío de la película de formación - M4M25200540-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Llevar a tope mecánico en el sentido indicado por la flecha o alinear tal como indica la figura. Aflojar el perno (1). Girar el collar (2) hasta ver el valor "9990" en el dispositivo de lectura (3). Girar el collar (2) hasta aumentar el valor a "0000" en el dispositivo de lectura (3). Al terminar la operación, apretar el perno (1) y restablecer el valor correspondiente al formato en trabajo.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno (1); dispositivo de lectura numérico (3)</span></div><div class="step-card__params"><strong>Valores:</strong> "9990" → "0000"; después restablecer el valor del formato en producción · manual pág. 42</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">41</span><span class="step-card__title">CONTROL FASE ESTACIÓN DE PRECALENTAMIENTO (3.6.1)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de precalentamiento - M4M30101640-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Acceder a la motorización posterior del grupo de precalentamiento. Si están presentes, comprobar que las dos muescas coloreadas (1 y 2) estén alineadas; si no lo están, aflojar el perno de fijación del rotor (3), restablecer la alineación y volver a apretar el perno. Si las muescas (1 y 2) no existen, girar manualmente la junta del motor (4) hasta colocar las placas de precalentamiento (5 y 6) en la posición de MÁXIMA ABERTURA; en esa condición el rotor (3b) debe encontrarse en la posición mostrada en la figura, con el sensor (7) ENCENDIDO. Si no fuera así, aplicar el restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno de fijación del rotor; giro manual de la junta del motor</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas 1 y 2 alineadas; placas de precalentamiento en máxima abertura; sensor (7) encendido · manual pág. 43</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">42</span><span class="step-card__title">RESTABLECIMIENTO DE LA FASE ESTACIÓN DE PRECALENTAMIENTO (3.6.2)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de precalentamiento - M4M30101640-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Girar manualmente la junta (1) del motor hasta colocar las placas de precalentamiento (2 y 3) en la posición de MÁXIMA ABERTURA. Aflojar el perno de fijación del rotor (4) y volver a colocarlo en la posición mostrada en la figura, con el sensor (5) ENCENDIDO.</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno de fijación del rotor (4)</span></div><div class="step-card__params"><strong>Valores:</strong> Placas en máxima abertura; sensor (5) encendido · manual pág. 44</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">43</span><span class="step-card__title">PUESTA A CERO ÍNDICE ALTURA PLACAS PRECALENTAMIENTO (3.6.3)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de precalentamiento - M4M30101640-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Desconectar y desmontar las placas de precalentamiento (1 y 2). Introducir el volante en el índice correspondiente (3) y girarlo hasta colocar los soportes de las placas (4 y 5) a fondo de carrera HACIA ARRIBA. Aflojar el pasador (6) presente en el collar (7) y girar este último hasta alcanzar el valor "9990" (8). Ahora girar en sentido contrario hasta alcanzar el valor "0000" (8). Apretar el pasador de acoplamiento (6).</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante manual; llave allen para el pasador (6) del collar (7)</span></div><div class="step-card__params"><strong>Valores:</strong> Soportes a fondo de carrera hacia arriba; secuencia "9990" → "0000" · manual pág. 45</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">44</span><span class="step-card__title">Control del paralelismo entre las placas de precalentamiento</span></div><div class="step-card__row"><span>Estación</span><span>Estación de precalentamiento (M4M30101640)</span></div><div class="step-card__row"><span>Procedimiento</span><span>Con una herramienta adecuada comprobar la altura (protuberancia) de cada uno de los tacos de apoyo (1) de las placas. Si no cumple la cota, aflojar la tuerca (2) y extraer el tornillo (3); levantar la cabeza del tornillo utilizando los espesores (4) suministrados (cód. C010010804). Verificar además la distancia entre las dos placas de precalentamiento (5 y 6) cerca de cada punto de apoyo.</span></div><div class="step-card__row"><span>Herramienta</span><span>Herramienta/galga adecuada para medir altura; espesores (suplementos) cód. C010010804; llave para tuerca (2) y tornillo (3)</span></div><div class="step-card__params"><strong>Valores:</strong> Saliente de cada taco de apoyo = 0,2 mm. Distancia entre las dos placas de precalentamiento (5 y 6) = 0,4 mm en proximidad de cada punto de apoyo. · manual pág. 46</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">45</span><span class="step-card__title">Comprobación fase estación de formación</span></div><div class="step-card__row"><span>Estación</span><span>Estación de formación - M4M35101810-2.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Desde el display realizar una puesta en fase (RIFASAMENTO). En la parte posterior del grupo comprobar que las muescas (1 y 2) estén alineadas como indica la figura. Si no lo están, aplicar el procedimiento de restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Display de la máquina (función puesta en fase / RIFASAMENTO)</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (1 y 2) alineadas · manual pág. 47</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">46</span><span class="step-card__title">Restablecimiento fase estación de formación</span></div><div class="step-card__row"><span>Estación</span><span>Estación de formación - M4M35101810-2.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Desde el display realizar una puesta en fase. Aflojar el perno (1) y modificar la posición del rotor (2) hasta alinear las dos muescas (3 y 4). Al terminar las operaciones, apretar el perno (1).</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno (1); display de la máquina</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (3 y 4) alineadas · manual pág. 48</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">47</span><span class="step-card__title">Puesta a cero índice altura enrasador (rasador)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo enrasador - M4M50102820-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Aflojar la manilla (1), acoplar el volante (2) y girarlo hasta colocar el soporte (3) a final de carrera en el sentido que indica la flecha. Aflojar el perno (4) presente en el collar (5) y girar este último hasta alcanzar el valor "9990" (6). Girar después en sentido opuesto hasta alcanzar el valor "0000" (6). Apretar el perno de acoplamiento (4).</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante de regulación; llave allen para el perno (4) del collar (5)</span></div><div class="step-card__params"><strong>Valores:</strong> Índice: primero "9990", luego en sentido opuesto "0000" · manual pág. 49</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">48</span><span class="step-card__title">Comprobación fase estación de soldadura</span></div><div class="step-card__row"><span>Estación</span><span>Estación de soldadura - M4M60101840-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>En la parte posterior del grupo comprobar que las muescas (1 y 2) estén alineadas como indica la figura. Si no lo están, aplicar el restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Inspección visual en la motorización posterior del grupo</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (1 y 2) alineadas · manual pág. 50</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">49</span><span class="step-card__title">Restablecimiento de la fase estación de soldadura</span></div><div class="step-card__row"><span>Estación</span><span>Estación de soldadura - M4M60101840-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Aflojar el perno (1) y modificar la posición del rotor (2) hasta alinear las dos muescas (3 y 4). Al terminar las operaciones, apretar el perno (1).</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno (1)</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (3 y 4) alineadas · manual pág. 51</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">50</span><span class="step-card__title">Verificación fase cortador (cizalla / tranciante)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de cortado y codificación - M4M65100380-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Efectuar la SINCRONIZACIÓN MÁQUINA (RIFASAMENTO MACCHINA). En la parte posterior del grupo comprobar que las muescas (1 y 2) estén alineadas como indica la figura. Si no lo están, aplicar el restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Display de la máquina (SINCRONIZACIÓN MÁQUINA)</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (1 y 2) alineadas · manual pág. 52</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">51</span><span class="step-card__title">Restablecimiento fase cortador (cizalla / tranciante)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de cortado y codificación - M4M65100380-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Efectuar la SINCRONIZACIÓN MÁQUINA. Aflojar el perno (1) y modificar la posición del rotor (2) hasta alinear las dos muescas (3 y 4). Al terminar las operaciones, apretar el perno (1).</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno (1); display de la máquina</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (3 y 4) alineadas · manual pág. 53</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">52</span><span class="step-card__title">Control de fase grupo prepunzones</span></div><div class="step-card__row"><span>Estación</span><span>Grupo prepunzones - M4A15401010-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Comprobar, en la motorización trasera del grupo, la alineación de las muescas (1 y 2). Si no fuera así, pasar al restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Inspección visual en la motorización trasera</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (1 y 2) alineadas · manual pág. 54</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">53</span><span class="step-card__title">Restablecimiento de fase grupo prepunzones</span></div><div class="step-card__row"><span>Estación</span><span>Grupo prepunzones - M4A15401010-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Aflojar el perno (1) y modificar la posición del dispositivo giratorio (rotor) (2) hasta obtener la alineación correcta de las muescas (3 y 4). Apretar el perno (1).</span></div><div class="step-card__row"><span>Herramienta</span><span>Llave allen para el perno (1)</span></div><div class="step-card__params"><strong>Valores:</strong> Muescas (3 y 4) alineadas · manual pág. 55</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">54</span><span class="step-card__title">Puesta a cero índice altura enrasador (grupo de alimentación)</span></div><div class="step-card__row"><span>Estación</span><span>Grupo de alimentación / cepillo enrasador - M4G12400720-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Aflojar la manilla (1), acoplar el volante (2) y girarlo hasta colocar el soporte (3) a final de carrera en el sentido que indica la flecha. Aflojar el perno (4) presente en el collar (5) y girar este último hasta alcanzar el valor "9990" (6). Girar después en sentido opuesto hasta alcanzar el valor "0000" (6). Apretar el perno de acoplamiento (4).</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante de regulación; llave allen para el perno (4) del collar (5)</span></div><div class="step-card__params"><strong>Valores:</strong> Índice: primero "9990", luego en sentido opuesto "0000" · manual pág. 56</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">55</span><span class="step-card__title">Puesta a cero índice de regulación de la inclinación</span></div><div class="step-card__row"><span>Estación</span><span>Grupo de alimentación con escobillas giratorias - M4G18104820-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Aflojar la manilla (A). Introducir el volante en el índice (1) y girarlo hasta colocar el grupo (2) a final de carrera tal y como indica la figura. Aflojar el perno (3) presente en el collar (4) y girar este último hasta alcanzar el valor "9990" (5). Girar después en sentido opuesto hasta alcanzar el valor "0000" (5). Apretar el perno de acoplamiento (3). Después de haber restablecido la regulación de formato (5), volver a apretar la manilla (A).</span></div><div class="step-card__row"><span>Herramienta</span><span>Volante de regulación; llave allen para el perno (3) del collar (4); manilla (A)</span></div><div class="step-card__params"><strong>Valores:</strong> Índice: primero "9990", luego en sentido opuesto "0000" · manual pág. 57</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">56</span><span class="step-card__title">Comprobación fase cinta de salida</span></div><div class="step-card__row"><span>Estación</span><span>Cinta / transportador de salida - M4G75102320-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Desde el display realizar un REAJUSTE DE FASE (RIFASAMENTO MACCHINA). Al terminar la puesta en fase, una pared de empuje blíster (1) ha de quedar centrada entre las muescas coloreadas (2 y 3). Si no lo está, consultar el restablecimiento de la página siguiente.</span></div><div class="step-card__row"><span>Herramienta</span><span>Display de la máquina (REAJUSTE DE FASE)</span></div><div class="step-card__params"><strong>Valores:</strong> Pared de empuje blíster (1) centrada entre las muescas coloreadas (2 y 3) · manual pág. 58</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">57</span><span class="step-card__title">Restablecimiento fase cinta de salida</span></div><div class="step-card__row"><span>Estación</span><span>Cinta / transportador de salida - M4G75102320-1.1</span></div><div class="step-card__row"><span>Procedimiento</span><span>Quitar la cobertura (A). Desde el display realizar un REAJUSTE DE FASE. Aflojar los tornillos (1 y 2) que bloquean la polea (3) en el eje de transmisión y mover manualmente la correa (4) hasta colocar una pared de empuje blíster (5) entre las dos muescas de colores (6 y 7). Apretar a fondo los tornillos (1 y 2). Volver a montar la cobertura (A).</span></div><div class="step-card__row"><span>Herramienta</span><span>Llaves para los tornillos (1 y 2) de la polea (3); display de la máquina</span></div><div class="step-card__params"><strong>Valores:</strong> Pared de empuje blíster (5) situada entre las muescas coloreadas (6 y 7); tornillos (1 y 2) apretados a fondo · manual pág. 59</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">58</span><span class="step-card__title">Programación guiada del artículo (Wizard) - procedimiento completo de puesta a punto del control de visión</span></div><div class="step-card__row"><span>Estación</span><span>Sistema de visión Harlequin sobre la blistera</span></div><div class="step-card__row"><span>Procedimiento</span><span>Secuencia de ventanas de diálogo. Teclas disponibles: volver a la ventana anterior, abortar el procedimiento de creación del artículo, abrir la Ayuda (actualmente no disponible) y pasar al cuadro de diálogo posterior. Pasos: 1) Creación del artículo (ex-novo o copiando uno existente escogido de la lista). 2) Número de productos diversos (si el blíster contiene más de un producto hay que especificar la cantidad). 3) Elección del tiempo de exposición: el Wizard lo elige midiendo la intensidad luminosa del producto contenido en el alvéolo; hay que introducir el producto manualmente al menos en un alvéolo que se encuentre en el campo encuadrado por la primera telecámara; con la máquina en marcha todos los productos son descartados durante todo el procedimiento; tras apretar el botón Autoexposición hay que indicar la posición del producto con un clic sobre él. 4) Adquisición de las imágenes con la máquina en marcha; tras la parada el Wizard pide clasificar cada imagen presentada. 5) Elección del tipo de producto (determina la elección de los parámetros de medición; las cápsulas de gelatina blanda se incluyen en la categoría de cápsulas de un solo color; si el blíster tiene más de un producto la elección se hace para cada uno). 6) Elección del tipo de cinta de formado (contribuye a determinar la elección de los algoritmos de búsqueda; las cintas semitransparentes coloreadas -ámbar, rojas, azules- deben clasificarse como TRANSPARENTES). 7) Elección del fondo (sólo se pide si la cinta es transparente). 8) Número de canales. 9) Número de filas. 10) Longitud del blíster (sólo si está activo el PLC interior de tipo 2). 11) Formato del blíster (layout rectangular o hexagonal y número de alvéolos). 12) Determinación de la posición de los alvéolos. 13) Colocación de las ventanas de referencia. 14) Cálculo automático de los parámetros de programación. 15) Aprendizaje con la máquina en marcha.</span></div><div class="step-card__row"><span>Herramienta</span><span>Producto íntegro para cargar manualmente en los alvéolos; ratón/pantalla táctil para los clics de referencia</span></div><div class="step-card__params"><strong>Valores:</strong> Imágenes necesarias: al menos 3 con todos los alvéolos llenos de producto íntegro y al menos 1 con todos los alvéolos vacíos. Pasos de aprendizaje propuestos: 10 (máquinas de movimiento alternado) / 20 (movimiento continuo). El cálculo de los parámetros de programación puede requerir hasta algunos minutos. · manual pág. 29-30</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">59</span><span class="step-card__title">Determinación de la posición de los alvéolos (referenciado del formato)</span></div><div class="step-card__row"><span>Estación</span><span>Sistema de visión Harlequin - Wizard</span></div><div class="step-card__row"><span>Procedimiento</span><span>El Wizard tiene que conocer la posición del PRIMER blíster en la pantalla; convencionalmente el primer blíster es el que, en la imagen de la primera cámara de vídeo, se encuentra más arriba y más a la izquierda. En el caso de rejilla RECTANGULAR el Wizard pide dos clics en el centro de dos alvéolos situados en dos ángulos diagonalmente opuestos. En el caso de rejilla HEXAGONAL se piden cuatro clics: en uno de los alvéolos más a la izquierda, en uno de los más a la derecha, en uno de los más arriba y en uno de los más abajo. Si el producto a controlar es una CÁPSULA, el Wizard requiere dos clics más en las extremidades de una cápsula.</span></div><div class="step-card__row"><span>Herramienta</span><span>Ratón sobre la imagen de la primera cámara de vídeo</span></div><div class="step-card__params"><strong>Valores:</strong> Rejilla rectangular: se piden los números máximos de alvéolos en vertical y en horizontal (ej.: 26 alvéolos, 5 máximo en vertical, 6 máximo en horizontal). Rejilla hexagonal: se pide el número de filas horizontales de alvéolos y la longitud máxima de las filas (ej.: 30 alvéolos, 10 líneas horizontales de longitud máxima 3). Si el blíster contiene más de un producto, las operaciones se repiten por cada producto. · manual pág. 30</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">60</span><span class="step-card__title">Colocación y ajuste gráfico de las ventanas de referencia y de control</span></div><div class="step-card__row"><span>Estación</span><span>Sistema de visión Harlequin - modo gráfico Ventanas</span></div><div class="step-card__row"><span>Procedimiento</span><span>El Wizard crea una ventana de referencia por cada telecámara y la coloca en una posición estándar; después pide al operador que ordene correctamente las ventanas de referencia oprimiendo el botón Ventanas para entrar en el modo gráfico y desplazarlas. En modo gráfico: la selección (amarilla → roja) o deselección (roja → amarilla) de una ventana se realiza con doble clic del botón izquierdo del ratón dentro de la ventana; la traslación de las ventanas seleccionadas (rojas) se realiza llevando el cursor al interior de la zona seleccionada y moviendo el ratón manteniendo apretada la tecla izquierda; el desplazamiento de un lado o de una esquina se realiza llevando el cursor FUERA de la zona seleccionada y moviendo el ratón con la tecla izquierda apretada. Funciones del menú Mover: Alinear (alinea las ventanas seleccionadas; la primera y la última ventana deben estar ya posicionadas), Reducir (hace idénticas las dimensiones de las ventanas seleccionadas llevándolas todas a las dimensiones de la ventana seleccionada más grande) y Anular (deshace la última operación gráfica devolviendo las ventanas a las dimensiones y posiciones anteriores). Selección → Ventanas Múltiples: emula el botón derecho dibujando un rectángulo de línea de puntos y selecciona todas las ventanas que caen completamente dentro.</span></div><div class="step-card__row"><span>Herramienta</span><span>Ratón; menú contextual Ventanas</span></div><div class="step-card__params"><strong>Valores:</strong> Selección: amarillo = no seleccionada, rojo = seleccionada · manual pág. 26-27, 30</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">61</span><span class="step-card__title">Aprendizaje (learning) de los valores nominales</span></div><div class="step-card__row"><span>Estación</span><span>Sistema de visión Harlequin - menú Aprendizaje</span></div><div class="step-card__row"><span>Procedimiento</span><span>Se accede desde Programación Artículo → Harlequin → Aprendizaje, que abre el menú Aprendizaje. En el panel Visualización está la función 'Valores Aprendidos' para ver los valores aprendidos. Al final del aprendizaje el Wizard elabora las tolerancias y las habilitaciones para el control del producto; su valor depende de la estadística observada por cada parámetro medido. Requiere la habilitación 'Aprendizaje'.</span></div><div class="step-card__row"><span>Herramienta</span><span>Máquina en marcha con producto bueno</span></div><div class="step-card__params"><strong>Valores:</strong> Número de pasos de aprendizaje: 10 (movimiento alternado) / 20 (movimiento continuo), variable · manual pág. 25, 27</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">62</span><span class="step-card__title">Verificación de la capacidad de control con muestras (validación)</span></div><div class="step-card__row"><span>Estación</span><span>Sistema de visión Harlequin - menú Funciones</span></div><div class="step-card__row"><span>Procedimiento</span><span>'Muestras Buenas': mide la capacidad de trabajo del artículo analizando un conjunto de imágenes previamente clasificadas como bueno, recogidas en los directorios DAT?????\\Good del artículo corriente. 'Muestras para Descartar': lo mismo con imágenes clasificadas como descarte, en los directorios DAT?????\\Fail. Al finalizar las medidas aparece una tabla con los resultados.</span></div><div class="step-card__row"><span>Herramienta</span><span>Conjuntos de imágenes previamente clasificadas</span></div><div class="step-card__params"><strong>Valores:</strong> Directorios DAT?????\\Good y DAT?????\\Fail (? indica una cifra) · manual pág. 16</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">63</span><span class="step-card__title">Adquisición de imágenes en simulacro de trabajo automático</span></div><div class="step-card__row"><span>Estación</span><span>Sistema de visión Harlequin - selección de fuente de imagen</span></div><div class="step-card__row"><span>Procedimiento</span><span>Se genera un conjunto de imágenes de referencia adquiridas en una marcha de la máquina: en esta marcha TODAS las muestras se clasifican como descartes y las eventuales colas de descarte se cancelan.</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">64</span><span class="step-card__title">Determinación práctica de la longitud de las colas de descarte</span></div><div class="step-card__row"><span>Estación</span><span>Estación de control de visión / estación de descarte de la blistera</span></div><div class="step-card__row"><span>Procedimiento</span><span>1) Poner en marcha la máquina sin cargar producto hasta el completo vaciado de la línea. 2) Cargar manualmente uno y un solo blíster aguas arriba de la estación de control. 3) Poner en marcha la máquina y pararla enseguida después de la soldadura del blíster. 4) Verificar que el blíster controlado haya sido considerado bueno por Harlequin (en caso de duda consultar la tabla de resultados numéricos). 5) Marcar los blísteres sobre la cinta según la figura (numeración -4,-3,-2,-1 / +1,+2,+3,+4 respecto al sentido de avance de la cinta de formado vista desde arriba, lado operador / lado máquina). 6) Poner en marcha la máquina y pararla después de que un blíster no haya sido descartado (enviado al estuchador). 7) Recuperar el blíster no descartado y leer el número escrito sobre él. 8) Abrir la página de las colas de descarte y, si el número del blíster es positivo pulsar la tecla +1, si es negativo pulsar -1, tantas veces como indique el número escrito en el blíster. 9) Repetir la prueba para asegurarse de que los nuevos valores son correctos.</span></div><div class="step-card__row"><span>Herramienta</span><span>Marcador para numerar los blísteres sobre la cinta; página de diálogo Programación de las Colas de Descarte</span></div><div class="step-card__params"><strong>Valores:</strong> Los pulsadores +1 y -1 modifican simultáneamente las colas de todos los grupos de alvéolos, aumentando o disminuyendo la longitud en un blíster. Solo si es indispensable se marca la casilla Habilitación Valores Numéricos para modificar individualmente los parámetros de las colas. · manual pág. 47-48</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">65</span><span class="step-card__title">Aprendizaje de los tiempos de tránsito (contracontrol en tiempo de tránsito, PLC interno Partena descarte paralelo)</span></div><div class="step-card__row"><span>Estación</span><span>Cintita de salida de blísteres / fotocélula aguas abajo del cizallador</span></div><div class="step-card__row"><span>Procedimiento</span><span>Marcar la casilla Aprendizaje de los Tiempos de Tránsito. Para que el aprendizaje pueda llevarse a cabo es necesario que la máquina no descarte ningún blíster durante toda la duración del aprendizaje; esto se consigue forzando las salidas en 'Siempre OK' en la página de diálogo de los Parámetros de Trabajo.</span></div><div class="step-card__row"><span>Herramienta</span><span>Página de diálogo del PLC interno; forzado de salidas Siempre OK en Parámetros de Trabajo</span></div><div class="step-card__params"><strong>Valores:</strong> Duración del aprendizaje: 10 filas de blísteres. Los tiempos de tránsito aprendidos se muestran por canal (canal 1 a canal 4, en ms) y deben estar escalados: si el canal 1 es el más cercano a la fotocélula de la cintita de salida debe cumplirse tch1 < tch2 < tch3. El último valor, separado por una raya, es el tiempo (ms) de inhibición de la fotocélula de la cintita tras detectar un blíster (durante ese tiempo la fotocélula ya no se lee desde que el frente del blíster la hace conmutar). La Tolerancia de los Tiempos de Tránsito (ms) es la variación máxima admitida respecto a los valores aprendidos. · manual pág. 44</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">66</span><span class="step-card__title">Medida e introducción de las distancias entre los detectores de la cintita (PLC interno Partena descarte serial)</span></div><div class="step-card__row"><span>Estación</span><span>Cintita de salida, desde el cizallador</span></div><div class="step-card__row"><span>Procedimiento</span><span>Medir manualmente las distancias entre los detectores montados sobre la cintita a partir del cizallador e introducirlas en mm en la página de diálogo. Orden de los detectores: detector 1 (primer detector para la medida de velocidad del blíster), detector 2 (segundo detector para la medida de velocidad), detector 3 (descarte de blísteres completamente vacíos), detector 4 (descarte de blísteres con defectos), detector 5 (control del descarte efectuado). Si no se ha instalado el descarte de blísteres completamente vacíos, los números van de 1 a 4 y el último campo (4→5) queda inhabilitado. Los detectores trabajan sobre el frente del blíster: Harlequin ignora todas las conmutaciones posteriores al frente durante toda su longitud, lo que hace el sistema de descarte insensible a las impresiones sobre el aluminio.</span></div><div class="step-card__row"><span>Herramienta</span><span>Metro / calibre para medir las distancias entre detectores; página de diálogo del PLC interno</span></div><div class="step-card__params"><strong>Valores:</strong> Distancias en mm entre detectores 1-2, 2-3, 3-4 y 4-5. Tolerancias de los tiempos de tránsito: se aconsejan valores de 50 a 100 ms. Tolerancia de distancia en mm cuando el control sobre la cintita es de tipo Distancia. Frecuencia del reloj de avance de cinta en impulsos por metro cuando se usa el control tipo Distancia. · manual pág. 45-46</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">67</span><span class="step-card__title">Aprendizaje de los parámetros de referencia del producto (Aprendizaje / Learning)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de control de visión (telecámaras)</span></div><div class="step-card__row"><span>Procedimiento</span><span>El aprendizaje es la operación de medida y almacenamiento de los parámetros de referencia de los productos. Se puede efectuar sobre imágenes estáticas o con la máquina en marcha. No es necesario que todos los alvéolos contengan producto ni que todos los productos medidos durante el aprendizaje estén correctos. Al finalizar, Harlequin calcula las tolerancias aconsejadas estimando la estadística de los parámetros medidos.</span></div><div class="step-card__row"><span>Herramienta</span><span>Función de aprendizaje de Harlequin; tecla Valores Aprendidos (tecla con las lentes)</span></div><div class="step-card__params"><strong>Valores:</strong> Por cada parámetro aparece en la ventana de diálogo un valor de tolerancia aconsejado, calculado durante el aprendizaje. Los niveles de color de los alvéolos vacíos se almacenan durante el aprendizaje, cuando la máquina marcha sin cargar producto. · manual pág. 43</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">68</span><span class="step-card__title">Aprendizaje asistido por Wizard (número de pasos de aprendizaje)</span></div><div class="step-card__row"><span>Estación</span><span>Estación de control de visión</span></div><div class="step-card__row"><span>Procedimiento</span><span>El número propuesto de pasos de aprendizaje puede variarse. El Wizard elabora las tolerancias y las habilitaciones para el control del producto al terminar el aprendizaje; el valor depende de la estadística observada por cada parámetro medido.</span></div><div class="step-card__row"><span>Herramienta</span><span>Wizard de Harlequin</span></div><div class="step-card__params"><strong>Valores:</strong> 10 pasos para máquinas con movimiento alternado; 20 pasos para máquinas con movimiento continuo. · manual pág. 31</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">69</span><span class="step-card__title">Prueba de Búsqueda (Prova Ricerca) - ajuste del Contraste de Búsqueda</span></div><div class="step-card__row"><span>Estación</span><span>Estación de control de visión</span></div><div class="step-card__row"><span>Procedimiento</span><span>El valor del contraste para la búsqueda del producto se debe individuar experimentalmente sirviéndose de la función Prueba Búsqueda. El resultado se muestra gráficamente dibujando un punto coloreado sobre el producto, o un conjunto de puntos (rejilla) en el caso de búsqueda bidimensional; si la búsqueda falla no se efectúa ningún dibujo. La tecla OK termina la prueba de búsqueda.</span></div><div class="step-card__row"><span>Herramienta</span><span>Función Prueba Búsqueda de Harlequin</span></div><div class="step-card__params"><strong>Valores:</strong> Contraste Búsqueda (valor experimental). En búsqueda tipo 'modelo' el resultado es un valor de correlación que debe ser mayor que el Contraste Búsqueda para que la búsqueda tenga éxito. · manual pág. 33-34</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">70</span><span class="step-card__title">Prueba de Medida - ajuste del Contraste de Medida</span></div><div class="step-card__row"><span>Estación</span><span>Estación de control de visión</span></div><div class="step-card__row"><span>Procedimiento</span><span>El valor del contraste para la medida se debe individuar experimentalmente sirviéndose de la función Prueba Medida. La medida es correcta cuando el dibujo del contorno de los objetos resulta normal, sin alejarse del contorno. Si el dibujo tiende a escapar hacia la parte externa del objeto medido hay que reducir el valor del contraste; si tiende a quedarse dentro hay que aumentarlo.</span></div><div class="step-card__row"><span>Herramienta</span><span>Función Prueba Medida de Harlequin</span></div><div class="step-card__params"><strong>Valores:</strong> El manual muestra medidas realizadas con contraste 10, 15, 25 y 50. · manual pág. 36</div></div>
              `
            },
            {
              id: "int-parametros",
              title: "Parámetros y cotas de ajuste",
              content: `
<p>Valores y cotas de ajuste que da la documentación.</p><table class="crit-table"><tbody><tr><th>Parámetro</th><th>Valor</th><th>Tolerancia</th><th>Pág.</th></tr><tr><td>Velocidad máxima con mando a distancia (comando a distanza)</td><td>30/35 ciclos por minuto máx.</td><td>Límite obligatorio durante trabajos con mando a distancia</td><td>15</td></tr><tr><td>Método B de regulación - sobrerrecorrido de aproximación</td><td>Ejemplo del manual: para pasar de 100 a 40 se baja hasta 35 y se sube a 40 (5 unidades de sobrerrecorrido)</td><td>Aproximación final siempre en sentido horario</td><td>18</td></tr><tr><td>Código del manual / versión</td><td>4A-M4160012-001, 16-11-2016, Versión Original</td><td>Manual redactado conforme a la directiva 2006/42/CE</td><td>7</td></tr><tr><td>Líquido de refrigeración interno recomendado</td><td>EUROCOLD Euroterm 131 (cualidades antiincrustante y antialga)</td><td>Código MARCHESINI C95LI0003</td><td>145</td></tr><tr><td>Capacidad mínima del depósito de recogida para el vaciado del circuito de refrigeración</td><td>Más de 5 litros</td><td></td><td>141</td></tr><tr><td>Caudal de la bomba para el lavado del sistema de refrigeración</td><td>Aproximadamente 20 l/min</td><td></td><td>142</td></tr><tr><td>Duración de la circulación del líquido de lavado del sistema de refrigeración</td><td>3-4 horas como mínimo</td><td></td><td>142</td></tr><tr><td>Tipo de fluido para el lavado del sistema de refrigeración</td><td>Fluido de lavado de tipo T (según tabla)</td><td></td><td>142</td></tr><tr><td>Reutilización del líquido de lavado recogido y filtrado</td><td>3/4 ciclos como máximo</td><td></td><td>143</td></tr><tr><td>Duración de la circulación de agua limpia en el aclarado</td><td>Aproximadamente media hora</td><td></td><td>143</td></tr><tr><td>Ventana de tiempo para verificar el nivel de aceite de la caja de perforación</td><td>Máquina parada desde al menos 5 minutos y no más de 30 minutos tras el apagado</td><td></td><td>166</td></tr><tr><td>Capacidad del recipiente para el vaciado del aceite de la caja de perforación</td><td>Aproximadamente 4 litros</td><td></td><td>166</td></tr><tr><td>Tipo de aceite de la caja de perforación</td><td>Aceite tipo A</td><td>Nivel entre el mínimo y la banda amarilla (1), sin rebasarla</td><td>166</td></tr><tr><td>Tipo de grasa para los engranajes de transmisión del grupo de perforación</td><td>Grasa tipo B</td><td>Aplicar con moderación sobre el perfil dentado</td><td>167</td></tr><tr><td>Tipo de lubricante para los movimientos de pre-punción</td><td>Tipo B</td><td></td><td>157</td></tr><tr><td>Tipo de grasa para las guías de la cabeza de alimentación</td><td>Tipo O (texto italiano) / tipo D (texto español)</td><td>Inyectar en los dos distribuidores indicados</td><td>175</td></tr><tr><td>Duración mínima de pulsación del botón de STOP para el lamp test</td><td>5 segundos como mínimo</td><td></td><td>150</td></tr><tr><td>Intervalo de sustitución de todos los filtros del armario eléctrico</td><td>Cada 3600 horas</td><td>Control de obstrucción cada 600 horas</td><td>147</td></tr><tr><td>Par de apriete del tornillo interno de acoplamiento motor-reductor</td><td>11 Nm</td><td>Llave dinamométrica calibrada a 11 Nm; verificación cada H (1200)</td><td>178</td></tr><tr><td>Excursión máxima de la correa de transporte de blísteres (tensado)</td><td>No debe rebasar los 30 mm</td><td>Medida en el punto indicado, sin exceder con la carga; verificación cada H (1800)</td><td>183</td></tr><tr><td>Frecuencia de limpieza y control de desgaste de cepillos / escobillas giratorias</td><td>H (300)</td><td></td><td>179, 181</td></tr><tr><td>Frecuencia de control de desgaste de la correa de transporte y de los dientes de empuje</td><td>H (900)</td><td></td><td>182</td></tr><tr><td>Frecuencia de control de desgaste de la correa de transmisión</td><td>H (1800)</td><td></td><td>180</td></tr><tr><td>Frecuencia de control del tensado de la correa de transporte</td><td>H (1800)</td><td></td><td>183</td></tr><tr><td>Frecuencia de comprobación del apretado motor-reductor</td><td>H (1200)</td><td></td><td>178</td></tr><tr><td>Frecuencia de limpieza y lubricación del movimiento de abertura de la pared</td><td>H (3600), lubricante OIL (B) — grasa de tipo B</td><td></td><td>176</td></tr><tr><td>Oscilación máxima de las cadenas de motorización del cicloide</td><td>15 mm</td><td>No debe superarse</td><td>91</td></tr><tr><td>Oscilación máxima de la cadena del transportador de salida</td><td>10 mm</td><td>No debe superarse</td><td>92</td></tr><tr><td>Par de apriete tornillo acoplamiento motor-reductor (cicloide)</td><td>6 Nm</td><td>Llave dinamométrica calibrada</td><td>98</td></tr><tr><td>Par de apriete tornillo acoplamiento motor-reductor (descarte motorizado)</td><td>5 Nm</td><td>Llave dinamométrica calibrada</td><td>103</td></tr><tr><td>Par de apriete tornillo acoplamiento motor-reductor (desenrollado film de formación)</td><td>5 Nm</td><td>Llave dinamométrica calibrada</td><td>108</td></tr><tr><td>Distancia mínima entre las dos semijuntas del acoplamiento de goma</td><td>1 / 2 mm</td><td>Mínima, obligatoria</td><td>112</td></tr><tr><td>Tiempo de estabilización antes de medir la temperatura con sonda (precalentamiento)</td><td>10 minutos como mínimo tras alcanzar la consigna</td><td></td><td>116</td></tr><tr><td>Temperatura de trabajo de las placas de precalentamiento</td><td>La indicada en la ficha de formato configurada (no fija en el manual)</td><td></td><td>116</td></tr><tr><td>Par de apriete tornillo acoplamiento motor-reductor (motorización pinzas de soldadura)</td><td>5 Nm</td><td>Llave dinamométrica calibrada</td><td>125</td></tr><tr><td>Par de apriete tornillo acoplamiento motor-reductor (motorización carro de soldadura)</td><td>35 Nm</td><td>Llave dinamométrica calibrada</td><td>127</td></tr><tr><td>Tiempo de estabilización antes de medir la temperatura con sonda (soldadura)</td><td>10 minutos como mínimo tras alcanzar la consigna</td><td></td><td>132</td></tr><tr><td>Temperatura de trabajo de la placa de soldadura</td><td>La indicada en la ficha de formato; consultable en el menú ESTADOS MÁQUINA > TEMPERATURAS</td><td></td><td>132</td></tr><tr><td>Nivel de aceite de la caja de codificación y cizallado</td><td>Dentro de la banda amarilla (1), sin bajar por debajo ni rebasarla</td><td>Medir entre 5 y 30 minutos tras el apagado</td><td>134</td></tr><tr><td>Capacidad del recipiente para vaciar el aceite de la caja de codificación y cizallado</td><td>Aproximadamente 4 litros</td><td></td><td>134</td></tr><tr><td>Orientación del elemento elástico de la junta (estación de formado)</td><td>Número '5' grabado dentro del elemento elástico (A) dirigido hacia el lado del reductor (3)</td><td></td><td>120</td></tr><tr><td>Velocidad máxima con mando a distancia</td><td>30/35 ciclos por minuto (máximo)</td><td>Valor máximo programado durante el funcionamiento con mando a distancia</td><td>21</td></tr><tr><td>Secuencia de puesta a cero de los reguladores numéricos (collares)</td><td>Girar hasta "9990" y luego en sentido opuesto hasta "0000"</td><td>Aplicable a: índice anchura película de formación, reguladores numéricos de rodillos de reenvío e índice de altura de placas de precalentamiento</td><td>40</td></tr><tr><td>Método A - paso a un valor SUPERIOR al planteado actualmente</td><td>ÚNICA OPERACIÓN: rotación HORARIA del control hasta el nuevo valor. Ejemplo: valor actual "100", nuevo valor "150" → girar en sentido horario directamente hasta "150"</td><td>Método obligatorio para reguladores numéricos y pomos de regulación</td><td>24</td></tr><tr><td>Método B - paso a un valor INFERIOR al planteado actualmente</td><td>DOS OPERACIONES: 1) rotación ANTIHORARIA del control hasta el valor "35"; 2) rotación HORARIA del control hasta el nuevo valor "40". Ejemplo: valor actual "100", nuevo valor "40"</td><td>Siempre debe rebasarse el valor por debajo y aproximarse en sentido horario para recuperar el juego</td><td>24</td></tr><tr><td>Código del manual</td><td>4-M4160012-001, fecha 18/11/2016, Versión Original</td><td>Directiva 2006/42/CE</td><td>13</td></tr><tr><td>Saliente (protuberancia) de cada taco de apoyo de las placas de precalentamiento</td><td>0,2 mm</td><td>Valor de referencia; si no se cumple, corregir con espesores cód. C010010804</td><td>46</td></tr><tr><td>Distancia entre las dos placas de precalentamiento (5 y 6)</td><td>0,4 mm</td><td>Medida en proximidad de cada punto de apoyo</td><td>46</td></tr><tr><td>Código de los espesores (suplementos) para el paralelismo de placas de precalentamiento</td><td>C010010804</td><td></td><td>46</td></tr><tr><td>Secuencia de puesta a cero de índices (enrasador e inclinación)</td><td>Girar el collar hasta "9990" y después en sentido opuesto hasta "0000"</td><td></td><td>49</td></tr><tr><td>Formato de indicación en las fichas de mantenimiento preventivo</td><td>H (900) - OIL (D): horas de intervención y letra del lubricante a utilizar</td><td>Ausencia de letra en la columna OIL = no se usa lubricante en esa operación</td><td>63</td></tr><tr><td>Formato de indicación en las fichas de sustitución preventiva</td><td>M (12): intervalo de sustitución expresado en meses</td><td></td><td>67</td></tr><tr><td>Lubricante A - FUCHS LUBRITECH Cassida GL 320 (NSF-H1)</td><td>Código C95OL00007 - componentes en baño de aceite</td><td></td><td>65</td></tr><tr><td>Lubricante B - MOSYL SYL53 / MOBIL Mobiltemp SHC 100</td><td>Códigos C95GR00004 / sin código - uso general y altas temperaturas</td><td></td><td>65</td></tr><tr><td>Lubricante D - MOLYGUARD I.SCO/10 2 / MOBIL Mobilith SHC 460</td><td>Códigos C95GR00013 / sin código - sólo para pares cónicos y guías lineales de ruedas</td><td></td><td>65</td></tr><tr><td>Lubricante E - FUCHS LUBRITECH Cassida Chain Oil 1500 (NSF-H1)</td><td>Código C95OL00006 - cadenas</td><td></td><td>65</td></tr><tr><td>Lubricante F - HD LUBE S1ES5 / FUCHS LUBRITECH Cassida Grease HTS2 (NSF-H1)</td><td>Códigos C95GR00006 (altas temperaturas) / C95GR00008 (específico para MS235)</td><td></td><td>65</td></tr><tr><td>Lubricante G - VANGUARD Gearing EP550 / MOBIL Mobilgear SHC 460</td><td>Código C95OL00008 / sin código - específico para transmisión BA100</td><td></td><td>65</td></tr><tr><td>Lubricante H - FUCHS LUBRITECH Cassida fluids HF32 (NSF-H1)</td><td>Código C95OL00005 - sólo para circuitos hidráulicos</td><td></td><td>65</td></tr><tr><td>Lubricante L - FUCHS LUBRITECH Cassida GL 150 (NSF-H1)</td><td>Código C95OL00003 - lubricación forzada</td><td></td><td>65</td></tr><tr><td>Lubricante N - SKF LG/LT2</td><td>Código C95GR00060 - husillos de bolas</td><td></td><td>65</td></tr><tr><td>Lubricante O - THK AFC Grease</td><td>Código C95GR00080 - guías de recirculación de bolas THK</td><td></td><td>65</td></tr><tr><td>Lubricante Q - Extralube ZX1 Micro Super Grease</td><td>Código C95GR00090 - ROBOMASTER</td><td></td><td>65</td></tr><tr><td>Refrigerante R - Glicol AREXONS</td><td>Código C95LI00001 - circuitos de refrigeración; mezclar 10% de glicol con 90% de agua</td><td>10% glicol / 90% agua</td><td>65</td></tr><tr><td>Producto S - MOLYGUARD MOLYSIL</td><td>Código C95BS00005 - limpieza de las superficies de deslizamiento</td><td></td><td>65</td></tr><tr><td>Producto T - Euroclean 1045 EUROCOLD</td><td>Código C95LI00004 - lavado para circuitos de refrigeración</td><td></td><td>65</td></tr><tr><td>Parámetros geométricos - Forma 1 a Forma 4</td><td>Los cuatro parámetros de forma son invariados respecto a rotación, traslación y cambio de escala</td><td>Forma 3 y Forma 4 miden ambas las asimetrías de la forma pero con distintas sensibilidades: la Forma 3 asume el valor mínimo mientras el objeto presenta dos ejes ortogonales de simetría y su valor crece cuando pierde uno solo de los dos ejes; la Forma 4 permanece estable (valor mínimo) mientras el objeto conserva por lo menos un eje de simetría, por lo que es menos sensible que la Forma 3 a pequeñas variaciones del contorno</td><td>9</td></tr><tr><td>Longitud (parámetro geométrico)</td><td>Se mide en ALTERNATIVA a la Forma 1</td><td></td><td>9</td></tr><tr><td>Hexagonalidad y Pentagonalidad</td><td>Se miden en ALTERNATIVA a la Forma 2 (véase parámetros especiales para la medida)</td><td></td><td>9</td></tr><tr><td>Parámetros pictóricos espacio RVA</td><td>6 parámetros en color: Nivel Rojo, Nivel Verde, Nivel Azul, Dispersión Rojo, Dispersión Verde, Dispersión Azul. En sistemas monocromáticos existe una única imagen, por lo que los parámetros medidos son 2 en lugar de 6</td><td>Son valores medios calculados sobre todos los pixel pertenecientes al objeto medido; histogramas de 0 a 255 niveles</td><td>9</td></tr><tr><td>Parámetros pictóricos espacio MSI</td><td>Matiz (tonalidad del color), Saturación (cantidad del color), Intensidad (luminosidad del color). Los valores MSI se calculan a partir de los valores RVA de cada pixel</td><td>Cuando el objeto medido posee dos colores, Harlequin mide separadamente los valores MSI sobre cada color, calculando 6 parámetros: Matiz 1, Saturación 1, Intensidad 1, Matiz 2, Saturación 2, Intensidad 2</td><td>10</td></tr><tr><td>Longitud mínima del ID de usuario</td><td>3 caracteres por lo menos</td><td></td><td>11</td></tr><tr><td>Longitud mínima de la password</td><td>6 caracteres; además la password debe contener por lo menos una cifra y una letra</td><td></td><td>17</td></tr><tr><td>Código de artículo nuevo</td><td>Máximo 30 caracteres</td><td></td><td>20</td></tr><tr><td>Descripción del artículo</td><td>Hasta 55 caracteres</td><td></td><td>20</td></tr><tr><td>Dirección del servidor para asistencia remota</td><td>192.168.1.1 para conexión directa; 82.90.12.33 en caso de conexión Internet (pedir a SEA Vision para eventuales cambios de la dirección IP)</td><td></td><td>15</td></tr><tr><td>Pasos de aprendizaje propuestos por el Wizard</td><td>10 pasos para las máquinas con movimiento alternado; 20 pasos para las de movimiento continuo. El número propuesto puede ser variado. El Wizard para la máquina después de aprendido el número de pasos elaborados</td><td></td><td>31 (referido al procedimiento que inicia en pág. 29-30)</td></tr><tr><td>Imágenes necesarias para el Wizard</td><td>Al menos 3 imágenes con todos los alvéolos llenos de producto íntegro y al menos 1 con todos los alvéolos vacíos. Las imágenes se adquieren con la máquina en marcha</td><td></td><td>29</td></tr><tr><td>Ejemplo formato blíster - rejilla rectangular</td><td>26 alvéolos, 5 alvéolos máximo en vertical, 6 alvéolos máximo en horizontal</td><td></td><td>30</td></tr><tr><td>Ejemplo formato blíster - rejilla hexagonal</td><td>30 alvéolos, 10 líneas horizontales de longitud máxima 3</td><td></td><td>30</td></tr><tr><td>Resolución del osciloscopio de señales E/S</td><td>De 1 segundo (resolución mínima) a 1 milisegundo (resolución máxima), variable con las teclas zoom</td><td></td><td>15</td></tr><tr><td>Nombre del Log-File</td><td>Formato hss_aaaa.log, donde ss = semana expresada como número de 0 a 51 y aaaa = año. Existe un Log-File por cada semana. El lunes es el primer día de la semana. Fichero exportado: log?????????.txt</td><td></td><td>16</td></tr><tr><td>Nombres de ficheros exportados</td><td>Artículo: DAT?????.BLI.txt (texto UNICODE). Versiones anteriores: DAT?????.nnnnn.bli.txt (nnnnn = nº progresivo de versión). Diferencias entre versiones: DAT?????.mmmmm.nnnnn.bli.txt (nnnnn = más reciente, mmmmm = más viejo). Lote en curso: current_batch.txt. Lotes producidos: DAT?????.nnnnn.btc.txt. Resultados de mediciones: lot?????.xxxx.csv</td><td></td><td>20, 21, 22</td></tr><tr><td>Rotación de imágenes en pantalla</td><td>90°, 180°, 270° o ángulo cualquiera; reflexión sobre eje Vertical u Horizontal</td><td></td><td>26</td></tr><tr><td>Pasos de aprendizaje propuestos (máquinas de movimiento alternado)</td><td>10 pasos</td><td></td><td>31</td></tr><tr><td>Pasos de aprendizaje propuestos (máquinas de movimiento continuo)</td><td>20 pasos</td><td></td><td>31</td></tr><tr><td>Nivel de Color (mezcla intensidad/saturación)</td><td>0 (sólo intensidad) a 256 (sólo saturación); ejemplos mostrados: 0, 80, 160, 256</td><td></td><td>31</td></tr><tr><td>Distancia desde el Color - componente Rojo del color de referencia</td><td>0 a 255</td><td></td><td>32</td></tr><tr><td>Distancia desde el Color - componente Verde del color de referencia</td><td>0 a 255</td><td></td><td>32</td></tr><tr><td>Distancia desde el Color - componente Azul del color de referencia</td><td>0 a 255</td><td></td><td>32</td></tr></tbody></table>
              `
            },
            {
              id: "int-formato",
              title: "Cambio de formato y optimización",
              content: `
<p><span class="src-tag src-manual">MANUAL 4A</span> Pasos del cambio de formato y optimización.</p><div class="step-card"><div class="step-card__head"><span class="step-card__num">1</span><span class="step-card__title">1. Verificar las condiciones asociadas ANTES de tocar nada</span></div><div class="step-card__row"><span>Cómo</span><span>Todas las regulaciones de la máquina están relacionadas entre sí: una sola variación errónea o superficial puede causar el mal funcionamiento completo de la instalación. Antes de efectuar cualquier modificación controlar: características del producto, condiciones de trabajo, y desgaste o rotura de piezas. Si se detecta una anomalía, controlar además el mantenimiento de la instalación (manual 'Mantenimiento Preventivo') y las sincronizaciones/fases (manual 'Sincronización de la instalación').</span></div><div class="step-card__params"><strong>Valores:</strong> Sección 3.2 Procedimiento (pág. 21 del extracto / 17 del manual)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">2</span><span class="step-card__title">2. Comprobar la calificación del personal</span></div><div class="step-card__row"><span>Cómo</span><span>El cambio de formato / optimización del formato pertenece a las 'Condiciones de intervención especiales'. Sólo pueden interpretarlo y ejecutarlo TÉCNICOS ESPECIALIZADOS habilitados y que conozcan la simbología de prevención de accidentes de la instalación.</span></div><div class="step-card__params"><strong>Valores:</strong> Calificación operativa de 2º nivel (condiciones de trabajo ESPECIAL)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">3</span><span class="step-card__title">3. Poner la máquina en condiciones de seguridad operativa</span></div><div class="step-card__row"><span>Cómo</span><span>Elegir la condición de seguridad adecuada al trabajo: BLOQUEO TOTAL, BLOQUEO PARCIAL o FUNCIONAMIENTO CON MANDO A DISTANCIA (véase apartado seguridad).</span></div><div class="step-card__params"><strong>Valores:</strong> Sección 2.2</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">4</span><span class="step-card__title">4. Tomar los datos de la 'Ficha técnica de planteamiento' del producto</span></div><div class="step-card__row"><span>Cómo</span><span>Las fichas técnicas de planteamiento (schede tecniche di impostazione) son hojas personalizadas por producto que dan TODOS los datos para la sustitución y/o la correcta regulación de cada dispositivo: valores a programar y códigos de las piezas a sustituir. Cada dispositivo de la máquina lleva un número de identificación que coincide con el número de operación de la ficha.</span></div><div class="step-card__params"><strong>Valores:</strong> Sección 3.3 (pág. 22 del extracto / 18 del manual)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">5</span><span class="step-card__title">5. Interpretar la ficha según el tipo de máquina</span></div><div class="step-card__row"><span>Cómo</span><span>Máquina MONOFORMATO: los datos de la ficha se usan sólo como notas para el control y la optimización del funcionamiento; se ignora toda la parte relativa a sustituciones. Máquina PLURIFORMATO: los datos sirven tanto para el control como para cambiar el planteamiento (formato) de la máquina.</span></div><div class="step-card__params"><strong>Valores:</strong> Sección 3.1</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">6</span><span class="step-card__title">6. Sustituir las piezas de formato indicadas</span></div><div class="step-card__row"><span>Cómo</span><span>En las columnas de datos personalizados de la ficha, el DATO DOBLE (F2) indica arriba el código de la pieza que se tiene que sustituir y abajo el dato que se programará en ese dispositivo. El DATO ÚNICO (F1) indica sólo el valor a programar (no hay sustitución).</span></div><div class="step-card__params"><strong>Valores:</strong> Campos F1 / F2 de la ficha</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">7</span><span class="step-card__title">7. Regular los dispositivos usando el método correcto de aproximación</span></div><div class="step-card__row"><span>Cómo</span><span>Programar cada regulador numérico o pomo con el valor tomado de la ficha, aplicando el método A (valor superior) o el método B (valor inferior) para eliminar el juego mecánico. Ver 'calibraciones'.</span></div><div class="step-card__params"><strong>Valores:</strong> Sección 2.4.3</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">8</span><span class="step-card__title">8. Utilizar obligatoriamente las herramientas y galgas en dotación</span></div><div class="step-card__row"><span>Cómo</span><span>Servirse de los accesorios especiales y de las galgas (DIME) codificadas siempre que la descripción lo requiera; el uso de herramientas no conformes puede dañar las piezas objeto de regulación.</span></div><div class="step-card__params"><strong>Valores:</strong> Sección 2.3 / 2.4.2</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">9</span><span class="step-card__title">9. Restablecer la máquina al terminar</span></div><div class="step-card__row"><span>Cómo</span><span>Tras el bloqueo parcial: rearmar el pulsador de EMERGENCIA y pulsar RESET. Tras trabajar con mando a distancia: quitar el mando a distancia del cuadro de mando y pulsar RESET para restablecer las funciones normales.</span></div><div class="step-card__params"><strong>Valores:</strong> Sección 2.2</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">10</span><span class="step-card__title">10. Si aparece un problema no contemplado</span></div><div class="step-card__row"><span>Cómo</span><span>Recoger los datos en la 'Ficha de Solicitud de Soporte Técnico' o en la 'Ficha de señalización de Defectos o Anomalías' y enviar copia a Marchesini Group S.p.A., que resolverá el problema e integrará las nociones que falten.</span></div><div class="step-card__params"><strong>Valores:</strong> Véase 'Soporte para el usuario', capítulo 1</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">11</span><span class="step-card__title">Restablecer el valor de formato tras la puesta a cero de un regulador numérico</span></div><div class="step-card__row"><span>Cómo</span><span>Al terminar la puesta a cero del regulador numérico (secuencia 9990 → 0000) y apretar el perno (1), restablecer el valor correspondiente al formato en trabajo tomándolo de las 'fichas técnicas de programación'.</span></div><div class="step-card__params"><strong>Valores:</strong> Valor de formato según ficha técnica de programación</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">12</span><span class="step-card__title">Programar un valor SUPERIOR en un regulador numérico (método A)</span></div><div class="step-card__row"><span>Cómo</span><span>Única operación: rotación horaria del control hasta el nuevo valor.</span></div><div class="step-card__params"><strong>Valores:</strong> Ejemplo: valor actual "100" → nuevo valor "150"</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">13</span><span class="step-card__title">Programar un valor INFERIOR en un regulador numérico (método B)</span></div><div class="step-card__row"><span>Cómo</span><span>Dos operaciones: 1) rotación antihoraria del control hasta el valor "35"; 2) rotación horaria del control hasta el nuevo valor "40".</span></div><div class="step-card__params"><strong>Valores:</strong> Ejemplo: valor actual "100" → nuevo valor "40" (pasando por "35")</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">14</span><span class="step-card__title">Uso de muescas de referencia en cambio de formato</span></div><div class="step-card__row"><span>Cómo</span><span>Las muescas de referencia pueden emplearse como referencia para regulaciones de sincronización o de cambio de formato, pero siempre en dispositivos con precisión NO micrométrica; deben usarse con atención procurando que los puntos marcados coincidan.</span></div><div class="step-card__params"><strong>Valores:</strong> Sin valor numérico (referencia visual)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">15</span><span class="step-card__title">Regulación de anchura de la película de formación</span></div><div class="step-card__row"><span>Cómo</span><span>El índice de anchura de la película de formación (grupo M4M25100930) se pone a cero con los contrastes laterales a final de carrera y la secuencia 9990 → 0000 antes de programar el valor del formato.</span></div><div class="step-card__params"><strong>Valores:</strong> 9990 → 0000</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">16</span><span class="step-card__title">Regulación de altura de las placas de precalentamiento</span></div><div class="step-card__row"><span>Cómo</span><span>El índice de altura de las placas de precalentamiento (grupo M4M30101640) se pone a cero con los soportes de las placas a fondo de carrera hacia arriba y la secuencia 9990 → 0000.</span></div><div class="step-card__params"><strong>Valores:</strong> 9990 → 0000</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">17</span><span class="step-card__title">Restablecer la regulación de formato tras la puesta a cero del índice de inclinación</span></div><div class="step-card__row"><span>Cómo</span><span>En el grupo M4G18104820-1.1, después de haber restablecido la regulación de formato (5), volver a apretar la manilla (A) que se había aflojado al inicio del procedimiento.</span></div><div class="step-card__params"><strong>Valores:</strong> Índice llevado antes a 9990 y luego a 0000</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">18</span><span class="step-card__title">Seleccionar el artículo de trabajo</span></div><div class="step-card__row"><span>Cómo</span><span>Menú Principal → Artículo → Selecciona Artículo: visualiza la lista de todos los artículos almacenados en el archivo; seleccionando el renglón del producto que interesa, ese producto queda elegido como artículo de trabajo.</span></div><div class="step-card__params"><strong>Valores:</strong> Requiere la habilitación 'Cambio artículo'</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">19</span><span class="step-card__title">Verificar que el artículo esté APROBADO</span></div><div class="step-card__row"><span>Cómo</span><span>Si la Gestión Archivos está habilitada, antes de ser usado para el trabajo automático el artículo debe ser aprobado (committed) por un usuario con la habilitación correspondiente, introduciendo su password. Cada cambio aportado al artículo corriente lo convierte en no aprobado (decommitted). La barra de estado indica 'Artículo aprobado' / 'Artículo no aprobado'.</span></div><div class="step-card__params"><strong>Valores:</strong> La aprobación copia el fichero del artículo en el directorio con el mismo nombre del fichero</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">20</span><span class="step-card__title">Crear un artículo nuevo (si el formato no existe)</span></div><div class="step-card__row"><span>Cómo</span><span>Menú Principal → Artículo → Gestión → Nuevo Artículo: se pide el código del nuevo artículo y una descripción opcional. También es posible Copia Artículo (crea uno nuevo idéntico pero con código diferente) o usar el Wizard para la creación guiada.</span></div><div class="step-card__params"><strong>Valores:</strong> Código: máximo 30 caracteres. Descripción: hasta 55 caracteres</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">21</span><span class="step-card__title">Programar/ajustar el artículo</span></div><div class="step-card__row"><span>Cómo</span><span>Menú Principal → Artículo → Programa Artículo: abre el menú Programación Artículo (Ventanas de alvéolos, Ventanas cinta, Ventanas de control, Búsqueda y Medida, Tolerancias Medida, Tolerancias Cinta, Defectos Críticos, Aprendizaje, Controles Multifunción, PLC Interno, Colas de descarte, Auxiliares de Descarte, Shift Register).</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">22</span><span class="step-card__title">Iniciar el lote</span></div><div class="step-card__row"><span>Cómo</span><span>Menú Principal → Lote → Inicio: permite introducir los datos de producción necesarios, llevar a cero los contadores de producción y permite a Harlequin entrar en Trabajo Automático y poner en marcha la línea. La operación se refiere sólo al artículo actualmente seleccionado como artículo de trabajo.</span></div><div class="step-card__params"><strong>Valores:</strong> NO es posible iniciar un nuevo lote del mismo artículo si no se termina el lote en curso mediante Fin Lote</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">23</span><span class="step-card__title">Cerrar el lote al terminar</span></div><div class="step-card__row"><span>Cómo</span><span>Menú Principal → Lote → Fin: cierra el lote en curso. Si la gestión histórica de los lotes está habilitada (Configuración → Gestión Sistema), por cada fin de lote se crea un nuevo fichero .BTC con los datos del lote terminado. Si está habilitada la opción 'Fin Lote con Ajuste a Cero de los Datos Variables', la función sustituye el valor de la cadena del código controlado con la cadena “00”.</span></div><div class="step-card__params"><strong>Valores:</strong> Cadena de sustitución: “00”</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">24</span><span class="step-card__title">Entrar en Trabajo Automático</span></div><div class="step-card__row"><span>Cómo</span><span>Menú Principal → Trabajo → Automático. Para salir: botón FIN AUTOMÁTICO (visible sólo con la máquina parada) o menú contextual Trabajo Automático → Fin Automático.</span></div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">25</span><span class="step-card__title">Selección del artículo mediante Super Artículo</span></div><div class="step-card__row"><span>Cómo</span><span>Un super artículo se utiliza como artículo master para definir formatos. El usuario con permisos de operador puede visualizar y seleccionar sólo los super artículos en la lista de artículos; además puede sustituir los artículos asociados al super artículo con artículos de la misma familia, pero no puede eliminar ni añadir ningún artículo asociado.</span></div><div class="step-card__params"><strong>Valores:</strong> Casilla Super Artículo en la página de Programación del Artículo (pág. 32)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">26</span><span class="step-card__title">Artículo contenedor</span></div><div class="step-card__row"><span>Cómo</span><span>Cuando un super artículo se identifica como artículo contenedor de otros artículos, no participa en el descarte de la pieza. Los artículos contenedores no deben contener alvéolos ni ventanas cinta; pueden gestionar las ventanas de las TVs multifunción y las auxiliares de descarte.</span></div><div class="step-card__params"><strong>Valores:</strong> Casilla Artículo contenedor (pág. 32)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">27</span><span class="step-card__title">Definir las ventanas de los alvéolos del nuevo formato</span></div><div class="step-card__row"><span>Cómo</span><span>En Programación de las Ventanas en los Alvéolos: seleccionar Número Grupo y Número Alvéolo con las flechas; usar Nuevo para crear un grupo (se crea vacío, sin ningún alvéolo; no se puede crear un alvéolo si antes no se ha creado al menos un grupo) o un alvéolo dentro del grupo; Copia para crear copiando el elemento seleccionado; Duplica (sólo a nivel de grupo) para duplicar el número de alvéolos del grupo; Cancela para borrar; Ventanas para entrar en modo gráfico y mover/dimensionar las ventanas con el ratón; Coordenadas para introducirlas manualmente.</span></div><div class="step-card__params"><strong>Valores:</strong> Campos informativos no modificables: Número Total Grupos, Número Total Alvéolos, Número Alvéolos del Grupo (pág. 40-41)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">28</span><span class="step-card__title">Definir las ventanas cinta (ventanas indicadoras / de referencia)</span></div><div class="step-card__row"><span>Cómo</span><span>Programación análoga a la de los alvéolos. Se colocan en zonas sin alvéolos, sobre partes metálicas (guías de la cinta de formado), para medir la intensidad de la luz (referencia de niveles) y balancear el color (referencia de blanco).</span></div><div class="step-card__params"><strong>Valores:</strong> Campos Ventana N., Total Ventanas, Coordenadas, Color Visualizado, Visualizada Tv, Adquisición, Ventanas (pág. 41-42)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">29</span><span class="step-card__title">Programar las colas de descarte del formato</span></div><div class="step-card__row"><span>Cómo</span><span>Asociar a cada grupo de alvéolos una salida de descarte y, opcionalmente, una salida de vacíos; definir Número del Descarte (canal), Número de la Fila, Distancia desde la Estación de Descarte, Número del Desviador de los Vacíos, Distancia desde el Desviador de los Vacíos, Número de la Señal de Bueno y Longitud de la Cola de Bueno.</span></div><div class="step-card__params"><strong>Valores:</strong> Fila 1 = la más cercana a la estación de descarte. En movimiento continuo existe una única fila controlada a cada paso; en movimiento alternado los números de fila deben especificarse correctamente por cada grupo porque determinan la secuencia de descartes (pág. 46-47)</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">30</span><span class="step-card__title">Verificar prácticamente la longitud de las colas de descarte</span></div><div class="step-card__row"><span>Cómo</span><span>Ejecutar el procedimiento de blíster único marcado descrito en el apartado 4.6.2 y corregir con las teclas +1 / -1 según el número leído en el blíster no descartado.</span></div><div class="step-card__params"><strong>Valores:</strong> pág. 47-48</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">31</span><span class="step-card__title">Ajustar los parámetros dependientes del artículo en el PLC interno (descarte serial)</span></div><div class="step-card__row"><span>Cómo</span><span>La página de diálogo muestra tanto los parámetros válidos para todos los artículos (por ejemplo las distancias entre los detectores) como los parámetros que dependen del artículo (por ejemplo la longitud del blíster).</span></div><div class="step-card__params"><strong>Valores:</strong> pág. 45</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">32</span><span class="step-card__title">Revisar los parámetros de trabajo marcados con punto amarillo</span></div><div class="step-card__row"><span>Cómo</span><span>Los parámetros identificados por un punto amarillo se refieren exclusivamente al artículo de trabajo seleccionado; los demás son parámetros de sistema utilizados por todos los artículos.</span></div><div class="step-card__params"><strong>Valores:</strong> pág. 51</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">33</span><span class="step-card__title">Habilitar las señales del iluminador en función del formato</span></div><div class="step-card__row"><span>Cómo</span><span>En Parámetros de Trabajo, el campo Señales Iluminador permite gestionar y habilitar las señales del iluminador en función del formato; con el pulsador % se programa la duración del encendido de cada bit de la palabra del iluminador como porcentaje del tiempo de exposición definido en el artículo.</span></div><div class="step-card__params"><strong>Valores:</strong> pág. 51</div></div><div class="step-card"><div class="step-card__head"><span class="step-card__num">34</span><span class="step-card__title">Control Cruzado Artículos (prevención de mix-up de formato)</span></div><div class="step-card__row"><span>Cómo</span><span>Número que identifica la familia de pertenencia del artículo, utilizado para el control cruzado de los artículos y para la gestión de los artículos asociados.</span></div><div class="step-card__params"><strong>Valores:</strong> pág. 43</div></div>
              `
            },
            {
              id: "int-sistemas",
              title: "Sistemas y componentes",
              content: `
<table class="crit-table"><tbody><tr><th>Sistema</th><th>Descripción</th><th>Componentes</th></tr><tr><td>Documentación de la máquina</td><td>Manual 4A 'Cambio de formato, Optimización de los dispositivos', código 4A-M4160012-001, versión original del 16-11-2016, redactado conforme a la directiva 2006/42/CE. Traducción del original italiano (agencia Intradoc S.r.l., UNI EN ISO 17100).</td><td>Se complementa con: Manual 2 'Descripción y ubicación de los instrumentos', 'Mantenimiento Preventivo', 'Sincronización de la instalación' (fases), capítulo 1 'Documentación de referencia' con la sección 'Seguridad y Prevención de accidentes' y 'Soporte para el usuario'.</td></tr><tr><td>Placas de identificación</td><td>En la máquina se aplican placas metálicas indelebles con los datos de identificación.</td><td>Placa de identificación de la máquina con marca CE; placa de características eléctricas de la máquina; en caso de línea, placa de identificación de la línea con marca CE (sólo en una de las máquinas de la línea, normalmente la primera si es del mismo fabricante).</td></tr><tr><td>Dispositivos de regulación de la máquina</td><td>Métodos de regulación presentes en la instalación.</td><td>Muescas de referencia (precisión no micrométrica); galgas de referencia (DIME) codificadas y suministradas con la máquina; reguladores numéricos y pomos de regulación (grupos que requieren regulaciones exactas y/o frecuentes).</td></tr><tr><td>Grupos referenciados en la ficha de formato</td><td>La ficha técnica de planteamiento clasifica las operaciones por grupo mediante círculos de color.</td><td>Grupos máquina (verde), grupos de alimentación (amarillo), grupos accesorios (azul), operaciones automáticas por ordenador (rojo).</td></tr><tr><td>Clasificación de la máquina por formato</td><td>Las máquinas se dividen en dos categorías que cambian la forma de interpretar las fichas.</td><td>Máquinas MONOFORMATO (la ficha sirve sólo de control y optimización, sin sustituciones) y máquinas PLURIFORMATO (la ficha sirve para control y para cambiar el planteamiento).</td></tr><tr><td>Sistema de refrigeración de la máquina (M4M92100320-1.95)</td><td>Circuito de agua/refrigerante conectado a un sistema centralizado, con llaves de paso de entrada y salida, medidores de flujo (flusostatos) y líquido refrigerante interno. Requiere limpieza en tres fases: vaciado, lavado y aclarado/llenado</td><td>Llaves de paso (1 y 2) de máquina y (1b y 2b) de descarga, empalmes IN y OUT, tubos de conexión (3 y 4), medidores de flujo/flusostatos con cristal de inspección, líquido EUROCOLD Euroterm 131 (código Marchesini C95LI0003)</td></tr><tr><td>Filtro del circuito de refrigeración (R329000301-1.3)</td><td>Filtro con cartucho interno instalado en el circuito de refrigeración, con llaves de seccionamiento</td><td>Llaves de paso (1 y 2), cuerpo de filtro (3), cartucho interno</td></tr><tr><td>Circuito neumático / grupo de filtración de aire (M4M90101430-1.1)</td><td>Grupo filtro con manómetro y campanas desmontables; requiere corte de corriente y despresurización total antes de intervenir</td><td>Grifo de corte (1), manómetro (2), circuito neumático (3), elementos de desbloqueo (4 y 5), campanas (6 y 7), elemento filtrador</td></tr><tr><td>Armario / tablero eléctrico (M4M96101410-1.1)</td><td>Cuadro eléctrico con rejillas de ventilación, filtros, ventiladores de enfriamiento, canaletas de cables, bornes y componentes de potencia y mando</td><td>Rejillas de ventilación (2), filtros internos (3), ventiladores de enfriamiento, canaletas (1), caja de alimentación de red (1), filtro de red (2), relés y contactores, tablero de bornes principal, de derivación y de masa, placas identificativas y tiras numeradas de cables</td></tr><tr><td>Grupo M4G18104820-1.1</td><td>Grupo del recorrido de alimentación con escobillas giratorias accionadas por correa de transmisión dentada, protegido por tapa delantera y coberturas.</td><td>Tapa delantera (1), correa de transmisión (2), poleas de perfil dentado, escobillas giratorias (2), pomos de fijación (3 y 4), coberturas (1)</td></tr><tr><td>Grupo M4G75102320-2.1</td><td>Transportador de salida de blísteres con correa dentada dotada de dientes de empuje; formado por dos tramos (A y B) unidos por una junta, con polea motriz y rodillo tensor. Interactúa con el robot y el almacén de estuches de la máquina línea abajo.</td><td>Correa de transporte (1), dientes de empuje (2), tuercas de bloqueo (2 y 3), tornillos de tensado (4 y 5), interruptor de seguridad, guías de la cinta, perno (3), rodillo (4), polea motriz (6), junta de unión (3) entre tramos A y B con tornillos y clavijas, tubos (cannotti) de sujeción del robot, distanciador entre la banda y la cinta de salida</td></tr><tr><td>Movimiento de abertura de la pared</td><td>Pared móvil extraíble hacia el exterior sobre ejes engrasados; se limpia con detergente a base natural y se engrasa con grasa tipo B.</td><td>Tornillos (1), pared (2), brocha (3), ejes (4), herramienta de engrase (5), engrasadores</td></tr><tr><td>Acoplamiento motor-reductor</td><td>Unión mecánica entre motor y reductor mediante un tornillo interno accesible tras quitar un tapón; par de apriete controlado con llave dinamométrica.</td><td>Tapón (1), tornillo interno de acoplamiento (2), motor (1), reductor (2)</td></tr><tr><td>Sistema de vacío</td><td>Genera y distribuye el vacío para la toma y transferencia de blísteres en el grupo cicloide</td><td>Conexión de vacío (1), tubo flexible, distribuidor de vacío (8), rotor del cicloide (7), ventosas de toma</td></tr><tr><td>Transmisión por cadenas y correas</td><td>Transmite el movimiento a cicloide y transportadores; requiere control periódico de tensado y desgaste</td><td>Cadenas de motorización cicloide (1 y 2) con tensores (3 y 4), cadena del transportador de salida (1) con tensador (2), correa de motorización de la cinta de salida y sus poleas dentadas</td></tr><tr><td>Motorizaciones motor-reductor con juntas elásticas</td><td>Grupos motor + reductor unidos por juntas elásticas; el remontaje se hace en vertical y los tornillos de acoplamiento llevan par controlado</td><td>Motor (1), reductor (2), junta elástica (A) con tope mecánico (B), tornillo de fijación (2), tapón de acceso (1), sello de aceite del reductor</td></tr><tr><td>Sistema térmico (termorregulación)</td><td>Calienta y regula la temperatura de las placas de precalentamiento y de la placa de soldadura según la ficha de formato; se verifica con sonda tras 10 minutos de estabilización</td><td>Placas de precalentamiento (1 y 2) con partes revestidas (7 y 8), tornillos especiales de medición (4 y 5), placa de soldadura, termorreguladores, sonda de verificación, menú ESTADOS MÁQUINA > TEMPERATURAS</td></tr><tr><td>Sistema de lubricación</td><td>Engrase manual mediante engrasadores y levas con distintos tipos de lubricante según el punto</td><td>Engrasadores de matriz (3 puntos), engrasadores del grupo soldadura (4, 5 y 6), engrasador de guía (2), jeringa/herramienta de engrase, grasas tipo B, tipo O y tipo D, aceite tipo A</td></tr><tr><td>Caja mecánica de codificación y cizallado en baño de aceite</td><td>Accionamiento mecánico lubricado por aceite tipo A con nivel visual e indicación de banda amarilla</td><td>Indicador de nivel con banda amarilla (1), tapa de llenado (A), tapón de descarga de aceite (2), cabezas de codificación (2 y 3), bornes de fijación (1), punzones de codificación</td></tr><tr><td>Dispositivos de regulación de la instalación</td><td>La instalación está dotada de tres métodos de regulación con procedimientos específicos.</td><td>MUESCAS DE REFERENCIA (tacche); GALGAS DE REFERENCIA (DIME); REGULADORES NUMÉRICOS Y POMOS DE REGULACIÓN</td></tr><tr><td>Muescas de referencia (2.4.1)</td><td>Se utilizan por regla general como puntos de referencia fijos para desensamblajes y ensamblajes. A veces se usan como referencia para regulaciones de sincronización o de cambio de formato, pero siempre en dispositivos con precisión NO micrométrica. Deben utilizarse con atención procurando que los puntos marcados coincidan.</td><td>Muescas coloreadas en discos, levas, rotores y juntas</td></tr><tr><td>Galgas de referencia / DIME (2.4.2)</td><td>Su uso debe atenerse escrupulosamente a lo indicado en cada operación. Puede haber más de una galga y la misma galga puede servir para más de una regulación. Si la instalación prevé el uso de GALGAS, éstas se suministran y se codifican con la propia instalación; las codificaciones acompañan a cada descripción correspondiente.</td><td>Galgas (DIME) codificadas suministradas con la máquina</td></tr><tr><td>Reguladores numéricos y pomos de regulación (2.4.3)</td><td>Se utilizan en los grupos de la máquina que requieren regulaciones exactas y/o frecuentes. El valor a programar se toma de las 'fichas técnicas de programación' y se ajusta siempre según el método A o B para eliminar el juego.</td><td>Collar (collarino) con perno/prisionero de bloqueo y dispositivo de lectura numérico</td></tr><tr><td>Accesorios y herramientas en dotación (2.3)</td><td>ACCESORIOS ESPECIALES EN DOTACIÓN: se utilizan para regulaciones estándar o en condiciones de acceso especiales para las que hay herramientas hechas a medida; es indispensable usarlas siempre que las descripciones lo requieran, porque el uso de herramientas no conformes podría dañar las partes sometidas a la regulación. HERRAMIENTAS DE MEDICIÓN: se usan para calibrados especiales o condiciones de instalación específicas; las mediciones deben efectuarse EN EJE con los puntos de referencia indicados, sin modificar bajo ningún concepto las partes que forman parte de tales referencias.</td><td>Accesorios especiales a medida; herramientas de medición (p. ej. nivel, volante manual)</td></tr><tr><td>Fichas de fase (capítulo 3) - interpretación</td><td>Las tablas indican en la primera columna el código del grupo al que se refiere la ficha y en la segunda su descripción. La tabla 'Secuencia comprobaciones puestas en fase (movimientos principales)' indica la secuencia obligatoria para el control esmerado o la puesta en fase completa de toda la motorización principal: hay que consultar SOLO la ficha cuya página aparece en la última columna. La tabla 'Índice general de las puestas en fase' lista TODAS las puestas en fase de la máquina, sin orden preciso. Tras las tablas hay esquemas para localizar el dispositivo con el número de ficha correspondiente. Consultar sólo las fichas no es suficiente porque no siguen un orden determinado.</td><td>Tabla de secuencia (movimientos principales); índice general de fases; esquemas de localización</td></tr><tr><td>Documentación e identificación de la máquina</td><td>Manual 4-M4160012-001, versión original del 18/11/2016, redactado de conformidad con la directiva 2006/42/CE por Marchesini Group S.p.A. (Via Nazionale, 100 - 40065 PIANORO (BO) ITALIA, Tel. (051) 6518711, Fax (051) 6516457). Traducciones de Intradoc S.r.l. conforme a UNI EN ISO 17100. En la máquina hay placas metálicas indelebles: placa de identificación de la máquina con marca CE y placa de características eléctricas. Si la máquina forma parte de una línea puede llevar la placa de identificación de la línea con marca CE, que sólo se aplica en una de las máquinas de la línea (normalmente la primera si es del mismo fabricante).</td><td>Placa de identificación con marca CE; placa de características eléctricas; placa de línea con marca CE</td></tr><tr><td>Sincronización de la instalación (Fasature sull'impianto)</td><td>Conjunto de procedimientos de verificación y restablecimiento de fase de las estaciones y de puesta a cero de índices de regulación; se debe controlar tras cualquier intervención de mantenimiento, especialmente si fue retrasada o si hay defectos</td><td>M4M30101640 (precalentamiento), M4M35101810-2.1 (formación), M4M50102820-1.1 (enrasador), M4M60101840-1.1 (soldadura), M4M65100380-1.1 (codificación/cortado), M4A15401010-1.1 (prepunzones), M4G12400720-1.1 (alimentación/cepillo), M4G18104820-1.1 (inclinación), M4G75102320-1.1 (cinta de salida)</td></tr><tr><td>Mantenimiento preventivo por horas (tablas H)</td><td>Tareas agrupadas por intervalo de horas de trabajo: H300, H600, H900, H1200, H1800 y H3600. Cada fila indica el código de grupo, la letra del lubricante OIL, el tipo de intervención y la página de la ficha; la última columna permite marcar la ejecución</td><td>Tablas de verificación de mantenimiento, fichas individuales y esquemas de localización de dispositivos</td></tr><tr><td>Sustituciones preventivas por meses (tablas M)</td><td>Sustituciones que se ejecutan por intervalo de tiempo en meses (M6, M12, M24...) independientemente de las horas de funcionamiento, para mantener la eficiencia de la instalación</td><td>Ventosas de toma, rodillos de desenrollado de película de formación, tacos de agarre del film, rodillo de arrastre de película</td></tr><tr><td>Lubricantes y refrigerantes recomendados</td><td>Tabla de productos probados por Marchesini Group identificados por letra (A, B, D, E, F, G, H, L, N, O, Q, R, S, T) con su código de pedido y su punto de aplicación; NSF-H1 indica aptitud para contacto accidental con alimentos</td><td>FUCHS LUBRITECH Cassida (GL 320, GL 150, Chain Oil 1500, Grease HTS2, fluids HF32), MOBIL (Mobiltemp SHC 100, Mobilith SHC 460, Mobilgear SHC 460), MOSYL SYL53, MOLYGUARD (I.SCO/10 2, MOLYSIL), HD LUBE S1ES5, VANGUARD Gearing EP550, SKF LG/LT2, THK AFC Grease, Extralube ZX1, Glicol AREXONS, Euroclean 1045 EUROCOLD</td></tr><tr><td>Harlequin / Harlequin Evolution (SEA Vision S.r.l.)</td><td>Sistema de medida y visión artificial para control de producto en máquinas termoformadoras. Fabricante: SEA Vision S.r.l., Via Folla di sopra 21 – 27100 Pavía (Italia), tel. +39 0382 529576, info@seavision.it, www.seavision.it. Manual Usuario versión 1.0, junio 2012. La numeración de versión/revisión del manual NO está relacionada con la versión del programa ejecutable instalado.</td><td>PC con Windows (shell Explorer), cámaras de vídeo (telecámaras) estándar y multifunción, iluminador neumático, PLC interno, puerta serial/red local para mandos remotos</td></tr><tr><td>Paquete opcional: Components pack</td><td>Permite controlar los anillos de color y los componentes en caja; también permite utilizar la función de control cruzado para los artículos y los caracteres.</td><td>Habilita: Control Anillos de Color (en la página de parámetros especiales de medida), Control Cruzado Artículo, Control Cruzado Caracteres</td></tr><tr><td>Paquete opcional: Symmetry pack</td><td>Permite controlar los objetos utilizando la Forma 3 y la Forma 4 (para medir las asimetrías de la forma), los comprimidos quebrados y mellados.</td><td>Habilita: Forma 3, Forma 4</td></tr><tr><td>Paquete opcional: Extra checks pack</td><td>Permite controlar producto doble en alvéolo de aluminio, pequeños fragmentos adyacentes al producto, producto fuera de los alvéolos, cinta sucia, paso de la máquina, manchas negras en el producto y presencia de polvo alrededor del producto.</td><td>Habilita: Número de Objetos, Sensibilidad de Búsqueda de los Fragmentos Adyacentes al Producto, Control Manchas & Polvo</td></tr><tr><td>Paquete opcional: Multi-product pack</td><td>Permite controlar blísters multi-producto.</td><td>Habilita: Artículos Asociados, Programación Artículos Asociados</td></tr><tr><td>Licencias y paquetes opcionales</td><td>Los paquetes opcionales pueden añadirse en cualquier momento pidiendo la licencia a SEA Vision, sin necesidad de cambiar la versión de software instalada. Para saber qué paquetes están instalados basta abrir la página Informaciones sobre el Sistema. En Harlequin Lite algunas funciones son opcionales y deben adquirirse por separado.</td><td>Página Informaciones Sistema (idioma siempre Inglés)</td></tr><tr><td>PLC interno</td><td>Gestiona el descarte (paralelo o serial), los shift registers asíncronos y genera contadores de alarmas visibles en la ventana de mensajes. Se programa desde Programación Artículo → Parámetros → PLC Interno.</td><td>Shift registers, colas de descarte, señales auxiliares de descarte</td></tr><tr><td>Ficheros del sistema</td><td>Fichero de configuración HARLE.INI (editable desde Configuración → Fichero de Configuración). Ficheros de artículo con extensión .BLI, ficheros de lote con extensión .BTC. Fichero de símbolos UNICODE symbols.txt para el teclado en pantalla.</td><td>HARLE.INI, DAT?????.BLI, .BTC, symbols.txt, log semanal hss_aaaa.log</td></tr><tr><td>Sistema de visión Harlequin Evolution (SEA Vision S.r.l.)</td><td>Sistema de inspección por telecámaras que ejecuta búsqueda y medida de los productos en los alvéolos del blíster, control de manchas y polvo, control de anillos de color, control de ventanas cinta y gestión del descarte.</td><td>Telecámaras (TV), iluminador con señales de strobe, PC con el software Harlequin, ventanas de alvéolos y ventanas cinta, colas de descarte.</td></tr><tr><td>PLC interno de Harlequin</td><td>Harlequin puede realizar funciones de PLC para gestionar la actuación de los descartes de blísteres en la línea de producción, en las máquinas que no gestionan directamente el descarte. Entra en función cuando el control está deshabilitado (por el menú de Configuración o por señal externa) o cuando el programa está en trabajo automático, con máquina parada o en movimiento.</td><td>Tipo 1: máquinas Partena con descarte paralelo. Tipo 2: máquinas Partena con descarte serial.</td></tr></tbody></table>
              `
            },
            {
              id: "int-vision",
              title: "Sistema de visión SEA Vision (Harlequin)",
              content: `
<p>La máquina lleva un sistema de <strong>visión artificial SEA Vision “Harlequin”</strong> que inspecciona el blíster (llenado, presencia y calidad) y puede <strong>parar la máquina</strong> o descartar blísteres.</p><div class="alert-box" style="background:#eef4ff;border-color:#cdddff">Cuando el sistema muestre un mensaje <strong>M0xx</strong>, búscalo en la pestaña <strong>“Alarmas visión”</strong>: están los mensajes con su causa y qué hacer. Las anomalías graves bloquean la máquina hasta introducir la contraseña.</div>
              `
            },
            {
              id: "int-hmi",
              title: "Panel de mando y controles",
              content: `
<table class="crit-table"><tbody><tr><th>Elemento</th><th>Función</th></tr><tr><td>Pulsador STOP</td><td>Detiene la instalación en STOP SINCRONIZADO (stop in fase). Es el primer paso obligatorio de las tres condiciones de seguridad operativa.</td></tr><tr><td>Interruptor general</td><td>Se lleva a la posición "0" para el BLOQUEO TOTAL de la instalación. Puede bloquearse con candado a discreción del usuario.</td></tr><tr><td>Grifo de la instalación neumática</td><td>Se cierra para el BLOQUEO TOTAL de la instalación. Puede bloquearse con candado (ubicación en el Manual 2 'Descripción y ubicación de los instrumentos').</td></tr><tr><td>Pulsadores de EMERGENCIA</td><td>Una vez terminado el ciclo tras el STOP, se pulsa uno de ellos para obtener el BLOQUEO PARCIAL de la instalación. Al terminar las operaciones debe rearmarse.</td></tr><tr><td>Pulsador de RESET</td><td>Restablece las funciones normales de la instalación después de rearmar el pulsador de emergencia o de retirar el mando a distancia.</td></tr><tr><td>Mando a distancia (comando a distanza) y su toma en el cuadro de mando</td><td>Se introduce en la toma prevista, con el ciclo terminado, para mover la máquina durante regulaciones con las funciones activadas a máx. 30/35 ciclos/min. Al terminar se saca del cuadro de mando y se pulsa RESET.</td></tr><tr><td>Numeración de identificación en cada dispositivo</td><td>Cada dispositivo regulable de la máquina lleva impreso el número que lo identifica; ese número es el 'identificativo de la operación' (campo D) de la ficha técnica de planteamiento.</td></tr><tr><td>Modalidad “Producción Normal”</td><td>Estado de máquina que se debe seleccionar para verificar la eficiencia de los termorreguladores de precalentamiento y de soldadura</td></tr><tr><td>Ficha de formato (scheda di formato)</td><td>Contiene las temperaturas de trabajo de precalentamiento y de soldadura que se cargan en los termorreguladores</td></tr><tr><td>Menú ESTADOS MÁQUINA --> TEMPERATURAS</td><td>Permite controlar y modificar la temperatura del termorregulador de sellado/soldadura</td></tr><tr><td>Pulsador de PARO / STOP</td><td>Debe usarse para parar la máquina antes de lubricar los movimientos de matriz y los movimientos anteriores del grupo de soldadura</td></tr><tr><td>Display - función PUESTA EN FASE (RIFASAMENTO)</td><td>Desde el display se ejecuta la puesta en fase de la máquina; es el paso previo obligatorio para el control y el restablecimiento de la fase del tambor cicloide y del expulsor de blíster.</td></tr><tr><td>Pulsador de STOP</td><td>Detiene la instalación en STOP SINCRONIZADO (stop en fase). Es el primer paso de las tres condiciones de seguridad operativa.</td></tr><tr><td>Mando a distancia y su toma en el cuadro de mando</td><td>Permite operar con las funciones de la instalación activadas a velocidad máxima de 30/35 ciclos/min. Se introduce en la toma adecuada tras detener la máquina en STOP SINCRONIZADO; al terminar es obligatorio sacarlo del cuadro de mando y pulsar RESET.</td></tr><tr><td>Volante manual (volantino)</td><td>Se acopla en los índices de regulación y en los grupos para girar manualmente los movimientos durante los controles de fase y las puestas a cero de índice.</td></tr><tr><td>Dispositivo de lectura numérico de los reguladores</td><td>Muestra el valor del regulador (p. ej. "9990" / "0000") durante la puesta a cero y el valor correspondiente al formato en trabajo.</td></tr><tr><td>Función RIFASAMENTO / Puesta en fase (REAJUSTE DE FASE) en el display</td><td>Lleva la máquina a la posición de referencia de fase para poder verificar la alineación de las muescas de cada estación (formación, cinta de salida) antes de cualquier corrección</td></tr><tr><td>Función RIFASAMENTO MACCHINA / SINCRONIZACIÓN MÁQUINA en el display</td><td>Sincroniza toda la instalación; obligatoria antes de verificar o restablecer la fase del cortador (M4M65100380-1.1) y de la cinta de salida (M4G75102320-1.1)</td></tr><tr><td>Estructura general de la pantalla</td><td>El usuario dispone de un menú de sistema, una barra de menú, una barra de estado y un área central para la pantalla de las imágenes. Por falta de teclado físico, cuando se requiere introducción de textos alfanuméricos aparece en pantalla un teclado que emula el teclado real; la tecla 'Symbols...' abre un segundo teclado con otros caracteres y alfabetos (Cirílico, Griego), contenidos en el fichero UNICODE symbols.txt.</td></tr><tr><td>Menú del Sistema (botón con logo SEA Vision arriba a la izquierda)</td><td>Abre el menú del sistema, que contiene las páginas de configuración de los parámetros del sistema y las funciones accesorias del sistema de visión: Manutención, Configuración, Asistencia, Funciones, Informaciones, Gestión Usuarios, Cambio idioma y Menú de salida.</td></tr><tr><td>Menú del Sistema → Manutención</td><td>Guardar el Artículo Seleccionado en memoria USB; Guardar Archivo en memoria USB (todos los ficheros, archivo completo); Guardar el Sistema en memoria USB (guarda el programa Harlequin y ficheros asociados, necesario ante la posibilidad de actualizar el programa); Guardar imagen en memoria USB; Recuperar Archivo de la memoria USB (Harlequin pide confirmación para sobrescribir el archivo completo); Importar Artículo.</td></tr><tr><td>Menú del Sistema → Configuración</td><td>Parámetros de Trabajo; Gestión Imágenes (parámetros de visualización); Entradas y Salidas (cuadro sinóptico de señales + osciloscopio); Alarmas (asignación de pulsadores de reset por categoría de alarma y clasificación como graves); Fecha y Hora; Fichero de Configuración (edición de HARLE.INI).</td></tr><tr><td>Menú del Sistema → Asistencia</td><td>'Número de serie, versión software y teléfono asistencia' visualiza el número de serie, la versión de software y el teléfono de asistencia remota. 'Llamada Asistencia': permite escoger INTERNET (habilita conexión por red Internet), número de teléfono (se pueden introducir pausas con uno o más puntos '.' dentro del número), dirección del servidor (192.168.1.1 conexión directa / 82.90.12.33 conexión Internet), velocidad de la conexión (depende de la calidad de la línea telefónica, no programable en todos los módems) y tonos o impulsos (según la centralita local). 'Cierre asistencia' cierra la conexión remota.</td></tr><tr><td>Menú del Sistema → Funciones</td><td>Medida Rendimientos; Muestras Buenas; Muestras para Descartar; Control Cruzado Artículos; Control Cruzado Caracteres.</td></tr><tr><td>Menú del Sistema → Informaciones</td><td>Informaciones Sistema (datos del sistema y paquetes opcionales instalados; el idioma es siempre el Inglés); Visualización File-Log; Escritura en Log-File (añadir mensajes al log); Gestión Colores; Triángulo de los Colores (relación entre el espacio RVA y el espacio MSI); Transformación RVA→MSI.</td></tr><tr><td>Menú del Sistema → Gestión Usuarios</td><td>Login (pide ID y password; si la gestión de usuarios no está habilitada el log-on sólo es posible como usuario Expert); Logout (vuelve al usuario por defecto Operator); Cambio Password (pide en orden la vieja password, la nueva y otra vez la nueva como confirmación); Gestión del Sistema.</td></tr><tr><td>Menú del Sistema → Cambio idioma</td><td>El cambio de idioma sólo puede ser efectuado por un usuario con la habilitación de administración del sistema.</td></tr><tr><td>Menú del Sistema → Menú de salida</td><td>Apagar (shutdown del sistema operativo); Reiniciar (termina la aplicación Harlequin, cierra la sesión de Windows y reinicia sistema operativo y aplicación); Salir (operación privilegiada permitida sólo al usuario Expert; si el sistema está protegido, la salida no permite el acceso al Desktop/Explorer).</td></tr><tr><td>Barra de Estado (parte baja de la pantalla)</td><td>A la izquierda informaciones sobre el estado del sistema y del lote en curso; a la derecha el tipo de visualización por vídeo y los usuarios logueados. Campos: Estado del sistema (Offline, Online, En Marcha, Cambia, Inhabilitado o en alarma); Estado del lote (Lote no iniciado / Lote abierto con el número de lote actual); Estado de actualización del archivo (advertencia si el archivo del dispositivo externo no está actualizado); Visualización de la pantalla (tipo de zoom y multi-TV o TV individual); Estado de autorización (Ningún usuario autorizado / Autorización activa); Artículo de trabajo (Artículo aprobado / Artículo no aprobado).</td></tr><tr><td>Barra de Menús - estructura</td><td>Distintos menús compuestos por paneles y botones de trabajo, más menús contextuales con las funciones del contexto específico; los contextuales se caracterizan por el botón 'Fin' que ocasiona la salida del menú. Cada elemento se muestra sólo si el usuario está habilitado para usar la función y si la configuración o el estado actual del sistema lo permiten. El icono y el texto descriptivo de cada elemento se pueden modificar en la fase de instalación del sistema.</td></tr><tr><td>Menú Principal</td><td>Trabajo (Automático, Exclusión); Lote (Inicio, Fin); Artículo (Selecciona Artículo, Wizard, Programa Artículo, Gestión: Nuevo/Copia/Cancelación/Aprobación/Visualización/Versiones precedentes, Importar Artículo, Exportar Artículo); Informes (Resultados de Medidas, Report: Lote en curso / Lotes producidos / Fichero de Resultados Mediciones); Controles (Bajar iluminador, Levantar iluminador, Iniciar Impresora, Stop Impresora); Periféricos (Impresoras: Configurador y Editor; Lectores de código: Alucode y Gestión); Salida de VNC; Login/Logout.</td></tr><tr><td>Menú contextual Trabajo Automático (online)</td><td>Trabajo → Fin Automático (termina el ciclo de trabajo en automático); Informes → Resultados de Medidas; Visualización (mandos de imagen más bloqueo/guardado de posición de las ventanas); Contadores (gestión de la ventana de contadores); Cola de descarte (gestión de la ventana de las colas de descarte); Shift Register (gestión de la ventana de los registros de desplazamiento).</td></tr><tr><td>Menú contextual Programación Artículo</td><td>Imágenes Fuente (Periféricos de adquisición, Artículo, Archivo local, Periférica externa/memoria USB); Artículos Asociados (Cambiar Master, Cambiar Slave, Artículos Asociados); Cambiar Artículo → Ventanas (Cambiar Ventana, Ventanas de Alvéolos, Ventanas Cinta, Ventanas Control); Harlequin (Búsqueda y Medida, Tolerancias Medida, Tolerancias Cinta, Defectos Críticos, Aprendizaje); Controles Multifunción (Caracteres, Códigos, Medidas Programables, PQV); Parámetros (Configuración Lote, Parámetros Artículo, PLC Interno, Colas de descarte, Auxiliares de Descarte, Shift Register); Visualización (Visualización overlay, Limpieza Pantalla, Info Cursor, Cambiar banda de color, rotación y reflexión, Resultados de Medidas).</td></tr><tr><td>Diseños de control sobre la imagen (trabajo automático)</td><td>Aparecen en sobreimpresión a la imagen adquirida al término de la medida. Son de tres tipos: diseño de control de la búsqueda del producto dentro del alvéolo; diseño de control de la medida en el contorno del producto; diseño de control del éxito de la medida, que coincide con la ventana rectangular programada por el usuario para cada alvéolo. CÓDIGO DE COLORES: AMARILLO = alvéolo vacío; VERDE = comprimido dentro de tolerancia (bueno); ROJO = comprimido defectuoso, para descartar; AZUL = comprimido con defecto crítico, para descartar.</td></tr><tr><td>Ventana de los mensajes</td><td>Visualiza todos los mensajes generados por Harlequin y los contadores de las alarmas generadas por el PLC interno.</td></tr><tr><td>Ventana de los contadores</td><td>Visualiza el número de piezas producidas (sin defectos, en verde) y de piezas descartadas (en rojo). Los contadores parciales se pueden resetear mediante la tecla correspondiente.</td></tr><tr><td>Mandos comunes - visualización de imágenes de vídeo</td><td>Visualización telecámaras múltiples (todas a la vez en pantalla); Visualización telecámara individual (una sola, especificada en el texto del pulsador); Zoom (imágenes ampliadas o visualización completa de la imagen).</td></tr><tr><td>Mandos comunes - selección de la fuente de imagen</td><td>Telecámara (la imagen de referencia se adquiere en el instante en que se aprieta el pulsador); Imagen adquirida con trigger; Imagen en pantalla; Imagen de Trabajo (asociada al artículo seleccionado); Imagen de Bueno; Imagen de Vacío; Archivo Local; Periférica externa (memoria USB); Imágenes adquiridas en simulacro de trabajo automático; Guardar (guarda la imagen de trabajo).</td></tr><tr><td>Gestión de los paneles informativos</td><td>Visualiza (muestra o esconde el panel asociado); Reduce (permite o impide la reducción del panel); Mueve (permite o impide mover el panel en el espacio de trabajo); Memoriza el estado del panel (memoriza la posición y el estado de visualización del panel de modo permanente).</td></tr><tr><td>Botones estándar de las páginas de diálogo</td><td>Nuevo (crea un nuevo objeto); Cancela (elimina el objeto actualmente seleccionado); Copia (copia el objeto seleccionado creando uno nuevo en el mismo artículo); Copia Externa (crea el nuevo objeto en artículos seleccionados a través de la página Copia Externa); OK (sale confirmando las modificaciones); Anula (sale sin guardar las modificaciones); Exportación (exporta los datos o el fichero a un dispositivo externo); Impresora (imprime los datos si hay impresora conectada).</td></tr><tr><td>Resultados de Medidas (tabla numérica)</td><td>Todas las medidas se almacenan en una zona de memoria dedicada; al agotarse la memoria se sobrescriben los datos cronológicamente más lejanos. Cada línea corresponde a un comprimido o a una ventana en la cinta (ventana indicadora). El primer campo contiene, para el comprimido, tres números: número de la medición (1 = la más vieja), número del grupo de alvéolos y número del alvéolo; para la ventana indicadora sólo el número de medición y el de ventana. En Aprendizaje y prueba de medida se muestran los valores numéricos ABSOLUTOS medidos; en trabajo (automático o manual) o en medida de rendimientos se muestran las DIFERENCIAS PORCENTUALES respecto al valor nominal, exceptuando el ángulo de rotación y los colores, cuyas separaciones se dan en GRADOS. Los colores de fondo de las cuadrículas tienen el mismo significado que los de las ventanas alrededor de los alvéolos. Un clic en la línea abre la imagen correspondiente si fue memorizada (menú: Diseños = muestra/esconde los dibujos, Pantalla = copia la imagen en la pantalla, Archivo = crea un fichero BMP).</td></tr><tr><td>Código</td><td>Contiene el nombre del artículo.</td></tr><tr><td>Descripción</td><td>Visualiza la descripción del artículo (no editable en la ventana de parámetros de medida).</td></tr><tr><td>Tv Visualizada</td><td>Selecciona la telecámara a visualizar; la opción zoom indica la visualización de todas las imágenes.</td></tr><tr><td>Color Visualizado</td><td>Selecciona el color de la visualización de la imagen.</td></tr><tr><td>Búsqueda y Medida</td><td>Indica sobre qué componente de color se efectúan las operaciones de búsqueda y medida (imagen de colores, rojo, verde, azul, o la opción L+C, o Distancia desde el Color).</td></tr><tr><td>Nivel de Color</td><td>Indica en qué proporción se mezclan intensidad y saturación (0 = sólo intensidad, 256 = sólo saturación).</td></tr><tr><td>Normalización</td><td>Fuerza la normalización de la saturación respecto a la intensidad para ecualizar zonas de distinta luminosidad.</td></tr><tr><td>Transforma Imágenes</td><td>Transforma las imágenes asociadas al artículo en imágenes monocromáticas según el Nivel de Color y la Normalización; el resultado se ve inmediatamente en pantalla.</td></tr><tr><td>Almacena Imágenes</td><td>Almacena en disco rígido las imágenes visualizadas.</td></tr><tr><td>Visualiza Imágenes</td><td>Visualiza en pantalla las imágenes asociadas al artículo.</td></tr><tr><td>Distancia desde el Color</td><td>Abre la página de programación/aprendizaje de la distancia desde el color; la imagen fuente se transforma en imagen binaria.</td></tr><tr><td>Tiempo de Exposición</td><td>Valor del tiempo de exposición por cada cámara de vídeo.</td></tr><tr><td>Adquisición</td><td>Adquiere las imágenes de las cámaras de vídeo (según el tiempo de exposición asociado al artículo o el definido en la página).</td></tr><tr><td>Tipo Comprimido (Clara sobre Fondo Oscuro / Oscura sobre Fondo Claro)</td><td>Si el objeto aparece más claro que su entorno se selecciona Clara sobre Fondo Oscuro; en caso contrario Oscura sobre Fondo Claro. El entorno del objeto es la sombra adyacente al borde, por lo que aunque la cinta sea blanca se debe usar Clara sobre Fondo Oscuro; también se usa siempre cuando se hace búsqueda y medida con la opción L+C.</td></tr><tr><td>Valores Aprendidos (tecla con las lentes)</td><td>Hace aparecer/desaparecer la ventana con los valores de referencia aprendidos; un clic sobre una casilla abre la página para modificar el valor.</td></tr><tr><td>Fechas & Usuarios</td><td>Muestra la página con la información sobre la fecha de modificación del artículo.</td></tr><tr><td>Parámetros Búsqueda</td><td>Abre la página de programación de los parámetros de búsqueda.</td></tr><tr><td>Parámetros Medida</td><td>Abre la página de programación de los parámetros de medida.</td></tr><tr><td>Parámetros Especiales</td><td>Abre la ventana de programación de los parámetros especiales de búsqueda o de medida según la página.</td></tr></tbody></table>
              `
            },
            {
              id: "int-seguridad",
              title: "Seguridad",
              content: `
<div class="alert-box">⚠ <strong>Antes de intervenir:</strong> aplicar las condiciones de <strong>seguridad operativa</strong> del manual, consignar la máquina y esperar el enfriamiento de las <strong>placas de precalentamiento y sellado</strong> (trabajan calientes).</div><table class="crit-table"><tbody><tr><th>Tema</th><th>Advertencia</th></tr><tr><td>BLOQUEO TOTAL DE LA INSTALACIÓN</td><td>Condición: intervenir con las funciones de la instalación totalmente desactivadas (por ejemplo, mantenimiento). Procedimiento: detener la instalación en STOP SINCRONIZADO con el pulsador STOP; cuando el ciclo haya terminado, colocar el interruptor general en posición '0' y cerrar el grifo de la instalación neumática. A discreción del usuario se pueden bloquear el interruptor y el grifo con un candado (ubicación en el Manual 2 'Descripción y ubicación de los instrumentos').</td></tr><tr><td>BLOQUEO PARCIAL DE LA INSTALACIÓN</td><td>Condición: intervenir con las funciones principales parcialmente desactivadas. Procedimiento: detener en STOP SINCRONIZADO con el pulsador STOP; una vez terminado el ciclo, pulsar uno de los pulsadores de EMERGENCIA. Al terminar es indispensable rearmar el pulsador de EMERGENCIA y pulsar RESET.</td></tr><tr><td>FUNCIONAMIENTO CON MANDO A DISTANCIA</td><td>Condición: intervenir con las funciones de la instalación activadas y con una velocidad máxima programada de 30/35 ciclos por minuto. Procedimiento: detener en STOP SINCRONIZADO con el pulsador STOP; una vez terminado el ciclo, introducir el mando a distancia en la toma adecuada. Al terminar es indispensable sacar el mando a distancia del cuadro de mando y pulsar RESET.</td></tr><tr><td>Calificación del personal</td><td>Las operaciones de cambio de formato / optimización del formato son 'Condiciones de intervención especiales' y sólo las pueden ejecutar TÉCNICOS ESPECIALIZADOS habilitados, conocedores de la simbología de prevención de accidentes de la instalación (capítulo 1 'Seguridad y Prevención de accidentes').</td></tr><tr><td>Calificación operativa de 1º nivel</td><td>Símbolo que identifica intervenciones ejecutables en 'Condiciones de funcionamiento NORMAL'.</td></tr><tr><td>Calificación operativa de 2º nivel</td><td>Símbolo que identifica intervenciones ejecutables en 'Condiciones de trabajo ESPECIAL' (es el nivel de este fascículo).</td></tr><tr><td>Prohibición en la limpieza</td><td>El símbolo de limpieza obligatoria impone usar aspiradores o paños mojados en soluciones detergentes no agresivas y PROHÍBE de forma absoluta el uso de chorros de aire comprimido, solventes químicos o gasolina.</td></tr><tr><td>Lubricación obligatoria</td><td>Símbolo que indica procedimientos de lubricación indispensables para mantener la calidad productiva, realizados con pinceles, engrasadores y lubricadores.</td></tr><tr><td>Riesgo de invalidación del certificado CE</td><td>Existe un símbolo que marca notas o procedimientos cuyo incumplimiento deja sin efecto la Declaración de Conformidad CE expedida por Marchesini Group S.p.A. y obliga al cliente a recertificar la instalación.</td></tr><tr><td>Herramientas no conformes</td><td>Es indispensable usar los accesorios especiales y las herramientas de medición en dotación siempre que la descripción lo requiera; el uso de herramientas no conformes podría dañar las partes sometidas a regulación.</td></tr><tr><td>Interdependencia de las regulaciones</td><td>Todas las regulaciones de la máquina están estrechamente ligadas entre sí: una sola variación errónea o superficial puede provocar el mal funcionamiento completo de la instalación.</td></tr><tr><td>Intervención en el circuito neumático</td><td>Quitar corriente mediante el interruptor general y cerrar el grifo (1) de la instalación. Intervenir SÓLO después de que el manómetro (2) señalice la ausencia total de presión en el circuito neumático (3)</td></tr><tr><td>Líquido de lavado del sistema de refrigeración</td><td>¡Atención, líquido irritante! Utilizar guantes y gafas de protección durante el lavado y durante el aclarado/llenado</td></tr><tr><td>Grupo cizalla</td><td>¡ATENCIÓN! Evitar que la máquina gire en vacío con la cizalla instalada para evitar el desgaste precoz de la misma</td></tr><tr><td>Intervención en el filtro del circuito de refrigeración</td><td>Detener la máquina con el pulsador de STOP y cerrar (seccionar) las llaves de paso (1 y 2) antes de desmontar el filtro</td></tr><tr><td>Intervención en los medidores de flujo</td><td>Apagar el sistema de refrigeración centralizado y cerrar las llaves de entrada y salida de la máquina antes de desmontar la tapa del flusostato</td></tr><tr><td>Intervención en el grupo prepunzones y en el grupo de perforación</td><td>Detener la máquina con el pulsador de paro antes de desenroscar los tapones de protección y lubricar</td></tr><tr><td>Adhesivos de emergencia</td><td>Debe existir un adhesivo amarillo de emergencia (2) debajo de cada botón de la instalación, y todas las placas y adhesivos de señalización eléctrica deben ser legibles</td></tr><tr><td>Limpieza de la telecámara</td><td>Levantar la campana (1) hasta que se active el bloqueo mecánico (2) antes de limpiar; al terminar, bajar la campana tirando del bloqueo mecánico</td></tr><tr><td>Productos de limpieza prohibidos</td><td>No utilizar bajo ningún concepto disolventes y/o gasolinas sobre el rodillo de arrastre de película</td></tr><tr><td>Interruptor de seguridad del transportador de blísteres</td><td>En el paso 4.29.3.2 (parte 2) del desmontaje de la correa se debe desmontar el interruptor de seguridad (1) SIN desconectarlo de la corriente (pág. 185); el circuito de seguridad permanece energizado, por lo que debe manipularse con la máquina parada y en condición segura.</td></tr><tr><td>Parada de la máquina antes del desmontaje</td><td>El procedimiento de desmontaje de la correa de transporte exige parar la máquina con el pulsador de STOP tras la sincronización, antes de retirar cualquier revestimiento (pág. 184).</td></tr><tr><td>Secuencia de los tubos de sujeción del robot</td><td>Solo después de haber montado y bloqueado en posición el tubo de soporte (3) se puede desmontar y extraer el tubo (4), para no dejar el robot sin sujeción sobre la cinta de transporte (pág. 195).</td></tr><tr><td>Fuerza de comprobación del tensado</td><td>Al medir la excursión de la correa de transporte hay que comprobar como ilustra la figura, sin exceder con la carga aplicada (pág. 183).</td></tr><tr><td>Parada de máquina antes de lubricar la matriz</td><td>Asegurarse de que la máquina está parada con el pulsador de paro (1) antes de desenroscar los tapones de protección e inyectar grasa en los engrasadores de los movimientos de matriz (4.9.1, pág. 118)</td></tr><tr><td>Parada de máquina antes de lubricar el grupo de soldadura</td><td>Asegurarse de que la máquina ha sido parada con el pulsador de PARO (1) antes de desenroscar el tapón de protección (2) y la cobertura (3) para lubricar los movimientos anteriores del grupo de soldadura (4.11.1, pág. 123)</td></tr><tr><td>Riesgo de quemadura en placas de precalentamiento</td><td>Comprobar la temperatura de las placas de precalentamiento (1 y 2) y, si es necesario, esperar su enfriamiento total antes de desconectar los cables eléctricos (3 y 4) y sacarlas (4.8.4, pág. 115)</td></tr><tr><td>Riesgo de quemadura en placas de soldadura</td><td>Dejar enfriar la estación de soldadura antes de extraer las placas soldadoras inferior y superior (4.11.7, pág. 129)</td></tr><tr><td>Desconexión eléctrica de las placas</td><td>Desconectar los cables eléctricos (3 y 4) de las placas de precalentamiento antes de aflojar las perillas (5 y 6) y extraerlas (4.8.4, pág. 115)</td></tr><tr><td>Productos de limpieza prohibidos</td><td>No utilizar productos a base de alcohol ni disolventes en el rodillo de desenrollado del film de formación (pág. 104), ni disolventes y/o gasolinas en los rodillos de transporte embragado (pág. 133)</td></tr><tr><td>Herramientas prohibidas sobre superficies delicadas</td><td>No usar espátulas ni herramientas en las placas de precalentamiento para no rayar su superficie (pág. 115); no usar herramientas metálicas en las placas de formado (pág. 119); el cepillo metálico en las placas de soldadura solo se admite en la placa SUPERIOR (pág. 129)</td></tr><tr><td>Marcha en vacío con punzones montados</td><td>¡ATENCIÓN! No hacer girar la máquina en vacío con los punzones de codificación montados, para evitar su desgaste prematuro (pág. 135)</td></tr><tr><td>BLOQUEO TOTAL DE LA INSTALACIÓN</td><td>CONDICIONES: intervenir con las funciones de la instalación totalmente desactivadas (por ej. mantenimiento). PROCEDIMIENTO: detener la instalación en STOP SINCRONIZADO mediante el pulsador de STOP; cuando el ciclo haya terminado, colocar el interruptor general en posición "0" y cerrar el grifo de la instalación neumática. A discreción del usuario se puede bloquear el interruptor y el grifo con un candado (ubicación en el Manual 2 'Descripción y ubicación de los instrumentos').</td></tr><tr><td>BLOQUEO PARCIAL DE LA INSTALACIÓN</td><td>CONDICIONES: intervenir con las funciones principales de la instalación parcialmente desactivadas. PROCEDIMIENTO: detener la instalación en STOP SINCRONIZADO mediante el pulsador de STOP; una vez terminado el ciclo, pulsar uno de los pulsadores de EMERGENCIA. Al terminar las operaciones es indispensable rearmar el pulsador de EMERGENCIA y pulsar RESET para restablecer las funciones normales.</td></tr><tr><td>FUNCIONAMIENTO CON MANDO A DISTANCIA</td><td>CONDICIONES: intervenir con las funciones de la instalación activadas y con una velocidad máxima programada de 30/35 ciclos/minuto. PROCEDIMIENTO: detener la instalación en STOP SINCRONIZADO mediante el pulsador de STOP; una vez terminado el ciclo, introducir el mando a distancia en la toma adecuada. Al terminar es obligatorio sacar el mando a distancia del cuadro de mando y pulsar RESET.</td></tr><tr><td>Calificación del personal</td><td>Las fases operativas de este fascículo pertenecen a las 'Condiciones de intervención especiales': deben interpretarlas y ejecutarlas exclusivamente TÉCNICOS ESPECIALIZADOS habilitados para regulaciones y/o control de la sincronización de la instalación y para la prevención/conservación de la calidad productiva. Deben conocer perfectamente los símbolos de prevención de accidentes (capítulo 1 'Seguridad y Prevención de accidentes').</td></tr><tr><td>Equipos de protección y herramienta</td><td>Es absolutamente indispensable que los técnicos estén vestidos oportunamente (monos de trabajo, guantes, etc.) y dispongan de las herramientas adecuadas para las operaciones a realizar sobre los dispositivos de la instalación. Págs. 62 y 66.</td></tr><tr><td>Advertencia sobre modificar las sincronizaciones</td><td>Las sincronizaciones deben modificarse SÓLO si se ha comprobado de la forma más segura que están mal reguladas. Todas las sincronizaciones de la máquina están relacionadas entre sí: una sola modificación incorrecta o inexacta puede desembocar en el mal funcionamiento de toda la instalación. Antes de cualquier modificación, y sobre todo si se detecta una anomalía, controlar también las condiciones asociadas: características del producto / condiciones de trabajo, y el estado del mantenimiento de la instalación.</td></tr><tr><td>Respeto de la secuencia de puesta en fase</td><td>Respetar atentamente la secuencia de la tabla de movimientos principales y realizar sólo las operaciones de las fichas indicadas; de lo contrario no se podrá restablecer correctamente el funcionamiento de la máquina.</td></tr><tr><td>Símbolo de obligación de limpieza</td><td>Indica procedimientos de limpieza indispensables para mantener la calidad productiva, realizados con aspiradores o paños mojados en soluciones detergentes no agresivas. PROHÍBE de la forma más absoluta la utilización de chorros de aire comprimido, solventes químicos, gasolina, etc.</td></tr><tr><td>Símbolo de obligación de lubricación</td><td>Indica procedimientos de lubricación indispensables para mantener la calidad productiva, realizados con pinceles, engrasadores, lubricadores, etc.</td></tr><tr><td>Riesgo de invalidación del certificado de conformidad CE</td><td>Símbolo que indica notas o procedimientos que, si no se cumplen, dejan sin efecto la 'Declaración de Conformidad CE' expedida por Marchesini Group S.p.A., librando al fabricante de toda responsabilidad y obligando al cliente a realizar una nueva certificación de la instalación.</td></tr><tr><td>Calificaciones operativas (1º y 2º nivel)</td><td>Símbolo de 1º nivel: intervenciones que pueden realizarse en 'Condiciones de funcionamiento NORMAL'. Símbolo de 2º nivel: intervenciones que pueden realizarse en 'Condiciones de trabajo ESPECIAL'. Ver la sección 'Calificaciones de los usuarios (Limitaciones de intervención)' del capítulo 1.</td></tr><tr><td>Otros símbolos de los textos</td><td>Subsistencia de peligro: operaciones con riesgos inmediatos o que pueden resultar peligrosas. Advertencia genérica: operaciones o temas de especial importancia. Obligación genérica: procedimientos de ejecución obligatoria para mantener la calidad productiva y la seguridad de la instalación.</td></tr><tr><td>Cualificación del personal</td><td>Las operaciones de mantenimiento y de control de sincronizaciones forman parte de las "Condiciones de intervención especiales" y deben llevarse a efecto por TÉCNICOS ESPECIALIZADOS que conozcan perfectamente los símbolos de prevención de accidentes (véase "Seguridad y Prevención de accidentes" del capítulo 1). Págs. 62 y 66.</td></tr></tbody></table>
              `
            }
          ],
          systems: [
            { name: "Desbobinado y precalentamiento", function: "Desenrollar y precalentar el PVC antes de formar.", components: ["Rodillo desbobinado M4M251", "Placas precalentamiento M4M301 (1800H)", "Termorreguladores"], status: "Manual p.145-180" },
            { name: "Formado y taza vibratoria", function: "Formar alvéolos y alimentar comprimidos con taza vibratoria.", components: ["Matriz M4M351", "Taza M4G062 + correa", "Cepillos"], status: "Manual p.180-210" },
            { name: "Corte y perforación", function: "Cortar y perforar blísteres con cizalla y perforador.", components: ["Cizalla M4M111", "Perforador M4A654", "Engranajes"], status: "Manual p.600H" },
            { name: "Arrastre y transporte", function: "Arrastrar film con rodillos y correas sincronizadas.", components: ["Rodillos arrastre", "Correas 700RPP5", "Cadenas cicloides 1800H"], status: "Manual p.300-360" },
            { name: "Refrigeración y neumática", function: "Refrigerar moldes y accionar neumática.", components: ["Flusostatos", "Filtros R329", "SMC SY212"], status: "Manual p.140-180" },
            { name: "Visión y control (Harlequin)", function: "Inspección y descarte con SEA Vision.", components: ["Harlequin M0xx-M5xx", "Telecámara M4A523", "PLC interno"], status: "Manual SEA Vision" }
          ],
          systemAtlas: {
            title: "Vista general Integra 320 + desglose",
            description: "Blistera con despiece de 399 tablas (MACHINE_TABLES) y 81 calibraciones. Mapa guiado por secciones del manual 4A.",
            machineMap: {
              title: "Integra 320 — línea completa",
              description: "Desbobinado → formado → alimentación → sellado → corte.",
              image: { src: "assets/integra320/despiece/p023.jpg", alt: "Integra 320 - despiece p023", page: 23 },
              hotspots: [
                { label: "1 Desbobinado", target: "desbobinado", x: 18, y: 18, w: 4, h: 6 },
                { label: "2 Formado", target: "formado", x: 35, y: 30, w: 4, h: 6 },
                { label: "3 Alimentación", target: "alimentacion", x: 52, y: 42, w: 4, h: 6 },
                { label: "4 Sellado/corte", target: "sellado", x: 68, y: 55, w: 4, h: 6 },
                { label: "5 Visión", target: "vision", x: 84, y: 28, w: 4, h: 6 }
              ]
            },
            systems: [
              { id: "desbobinado", name: "Desbobinado y precalentamiento", kicker: "M4M251/M4M301", station: "Pre-formado", page: 145, status: "Manual p.145", figure: { src: "assets/integra320/despiece/p023.jpg", alt: "Desbobinado", title: "Rodillos y precalentamiento", page: 23, caption: "Desbobinado film PVC + placas calientes." }, summary: "Prepara el film. Lubricación tipo B cada 300H, control filtros.", flow: ["Bobina → rodillos", "Precalentamiento 140-180H", "Control aceite perforación"], components: ["M4M251 desbobinado", "M4M301 precalentamiento", "Flusostatos"], adjustments: ["Nivel aceite perforación H1800", "Fase volante"], diagnostics: ["Cristal sucio → lavar flusostato p.140"] },
              { id: "formado", name: "Formado y taza vibratoria", kicker: "M4M351/M4G062", station: "Formado", page: 180, status: "Manual p.180", figure: { src: "assets/integra320/despiece/p024.jpg", alt: "Formado", title: "Matriz y taza", page: 24, caption: "Matriz M4M351 + taza vibratoria." }, summary: "Forma alvéolos y vibra producto. Correa taza cada 3600H.", flow: ["Matriz forma alvéolo", "Taza vibra → paletas", "Cepillos orientan"], components: ["Matriz M4M351", "Taza M4G062", "Cepillos"], adjustments: ["Paletas M4G121 p.300", "Correa taza H3600"], diagnostics: ["Paletas desgastadas → estrella p.300"] },
              { id: "sellado", name: "Sellado y corte", kicker: "M4M351/M4A654", station: "Sellado", page: 210, status: "Manual p.210", figure: { src: "assets/integra320/despiece/p026.jpg", alt: "Sellado", title: "Cizalla y perforador", page: 26, caption: "Cizalla + rodillo arrastre." }, summary: "Sella y corta blísteres. Cizalla H600, rodillo H300.", flow: ["Sellado térmico", "Cizalla corta", "Rodillo arrastra"], components: ["Cizalla M4M111", "Rodillo arrastre", "Perforador"], adjustments: ["Filo cizalla H600", "Rodillo H300/M6"], diagnostics: ["Corte irregular → filo cizalla"] },
              { id: "vision", name: "Visión Harlequin + neumática", kicker: "M4A523/SMC", station: "Visión", page: 240, status: "SEA Vision", figure: { src: "assets/integra320/despiece/p030.jpg", alt: "Visión", title: "Harlequin M0xx-M5xx", page: 30, caption: "Inspección M0xx-M5xx." }, summary: "Inspecciona con Harlequin; descarta vía PLC interno.", flow: ["Telecámara M4A523 → Harlequin", "M0xx defectos", "PLC descarta"], components: ["Harlequin", "Telecámara", "Fibras"], adjustments: ["Limpieza óptica H300", "Calibrar fibras M541"], diagnostics: ["M002 luz → cambiar lámpara"] }
            ]
          },
          spareParts: [],
          maintenanceTasks: [
            { name: "Control del mantenimiento preventivo de la instalación antes de un cambio de formato u optimización", system: "Toda la instalación", frequency: "Antes de cualquier modificac", type: "Preventivo", acceptance: "Véase el manual 'Mantenimiento Preventivo'" },
            { name: "Control de las sincronizaciones (fases) de la instalación", system: "Toda la instalación", frequency: "Antes de cualquier modificac", type: "Preventivo", acceptance: "Véase el manual 'Sincronización de la instalación'" },
            { name: "Verificación de desgaste o rotura de piezas", system: "Dispositivos objeto de regulación", frequency: "Antes de efectuar cualquier", type: "Preventivo", acceptance: "Junto con las características del producto y las condiciones de trabajo" },
            { name: "Verificar el desgaste de la placa cizalla: aflojar los tornillos de fijación (1), extraer la cizalla (2) y comprobar el estado de los elementos de ciz", system: "Grupo cizalla / tranciante", frequency: "H (600)", type: "Preventivo", acceptance: "Los márgenes de cizallado no deben presentar irregularidades ni grietas. Evitar que la máquina gire en vacío con la cizalla instalada" },
            { name: "Control del desgaste del rodillo de arrastre de película (1)", system: "Arrastre de película", frequency: "H (300)", type: "Preventivo", acceptance: "No debe presentar grietas ni deformaciones; si está dañado, sustituir el rodillo" },
            { name: "Sustitución preventiva del rodillo engomado de arrastre de película (1): desmontar la brida (2), quitar la arandela (3), desmontar el puente (4) y des", system: "Arrastre de película", frequency: "M (6)", type: "Preventivo", acceptance: "Sustituir aunque no presente desgaste aparente; anotar la fecha de sustitución" },
            { name: "Limpieza de la superficie externa del rodillo de arrastre de película con paño embebido en solución detergente ligera", system: "Arrastre de película", frequency: "H (300)", type: "Preventivo", acceptance: "No utilizar bajo ningún concepto disolventes ni gasolinas" },
            { name: "Sustitución del elemento filtrador del grupo neumático: quitar corriente con el interruptor general, cerrar el grifo (1), esperar a que el manómetro (", system: "Circuito neumático (M4M90101430-1.1)", frequency: "H (3600)", type: "Preventivo", acceptance: "Intervenir solo con corriente cortada y presión cero confirmada en el manómetro" },
            { name: "Limpieza del sistema de refrigeración - VACIADO: con la máquina bajo tensión, cerrar las llaves (1 y 2) y el flujo del sistema centralizado, desconect", system: "Sistema de refrigeración (M4M92100320-1.95)", frequency: "Según programa de limpieza d", type: "Preventivo", acceptance: "El depósito de recogida debe tener capacidad superior a 5 litros" },
            { name: "Limpieza del sistema de refrigeración - LAVADO: con bomba (1) de aproximadamente 20 l/min y tanque (2) de fluido de lavado tipo T, colocar el tubo de ", system: "Sistema de refrigeración (M4M92100320-1.95)", frequency: "Duración del lavado: 3-4 hor", type: "Preventivo", acceptance: "¡Líquido irritante! Utilizar guantes y gafas de protección" },
            { name: "Limpieza del sistema de refrigeración - ACLARADO Y LLENADO: comprobar la limpieza mirando el interior de todos los medidores de flujo (1); repetir el ", system: "Sistema de refrigeración (M4M92100320-1.95)", frequency: "Al terminar el lavado", type: "Preventivo", acceptance: "El cristal de los medidores de flujo no debe estar sucio; el líquido de lavado se puede reutilizar 3/4 ciclos como máximo; si el agua sale con demasia" },
            { name: "Control y limpieza de los medidores de flujo (flusostatos): comprobar que se vea el líquido a través del cristal (1) de cada flusostato (2 y 3); si no", system: "Sistema de refrigeración (M4M92100320-1.95)", frequency: "H (1800)", type: "Preventivo", acceptance: "El líquido del circuito debe verse a través del cristal de todos los flusostatos" },
            { name: "Limpieza y sustitución del filtro del circuito de refrigeración: detener la máquina con el pulsador de STOP, cerrar las llaves (1 y 2), desmontar el f", system: "Filtro de refrigeración (R329000301-1.3)", frequency: "H (1800)", type: "Preventivo", acceptance: "Sustituir el filtro completo si pierde líquido o presenta deterioro evidente" },
            { name: "Sustitución de los filtros del armario eléctrico: abrir el tablero eléctrico (1), desmontar todas las rejillas de ventilación (2) y comprobar el grado", system: "Armario eléctrico (M4M96101410-1.1)", frequency: "H (600) para el control; sus", type: "Preventivo", acceptance: "Los filtros no deben estar embozados" },
            { name: "Control del funcionamiento de los ventiladores de enfriamiento del armario eléctrico (2)", system: "Armario eléctrico (M4M96101410-1.1)", frequency: "H (600)", type: "Preventivo", acceptance: "Deben girar sin esfuerzo ni endurecimientos y los motores no deben presentar signos de sobrecalentamiento" },
            { name: "Control del estado de los cables eléctricos: abrir todos los canales/canaletas (1) y verificar los cables de la instalación", system: "Instalación eléctrica", frequency: "H (600)", type: "Preventivo", acceptance: "Los cables no deben presentar grietas, roturas ni cortes, ni estar quemados o endurecidos por exceso de calor; verificar el desgaste de los cables som" },
            { name: "Control del funcionamiento de los dispositivos de señalización (lamp test): pulsar el botón de STOP (1) durante al menos 5 segundos y comprobar el avi", system: "Señalización / seguridad", frequency: "H (600)", type: "Preventivo", acceptance: "Todos los indicadores luminosos y acústicos deben activarse durante el lamp test" },
            { name: "Control de presencia de las placas identificativas de los componentes eléctricos (1)", system: "Armario eléctrico / instalación eléctrica", frequency: "H (600)", type: "Preventivo", acceptance: "Todo componente eléctrico debe llevar su placa con el número de identificación; si se pierde, localizar el componente en el esquema eléctrico y volver" },
            { name: "Control de presencia de los identificadores (tiras numeradas) de los cables eléctricos (1) cerca del punto de fijación", system: "Instalación eléctrica", frequency: "H (600)", type: "Preventivo", acceptance: "Ante extravío o numeración incompleta, identificar el cable en el esquema eléctrico y volver a numerarlo de inmediato" },
            { name: "Control del estado de los componentes: verificar integridad general, motores sin señales de calentamiento, relés y contactores sin desgaste ni ennegre", system: "Armario eléctrico (M4M96101410-1.1)", frequency: "H (600)", type: "Preventivo", acceptance: "Sin señales de sobrecalentamiento, desgaste ni ennegrecimiento de contactos" },
            { name: "Control de la fijación de los componentes: fijación mecánica, alineación y cableado de fotocélulas y espejos catadióptricos; fijación mecánica de elec", system: "Componentes eléctricos de campo", frequency: "H (600)", type: "Preventivo", acceptance: "Todos los componentes correctamente fijados y alineados" },
            { name: "Control del apretado de las cajas de bornes: verificar todos los bornes (1) del tablero de bornes principal, de derivación y de masa", system: "Armario eléctrico / bornes", frequency: "H (600)", type: "Preventivo", acceptance: "Los bornes deben estar bien sujetos y no aflojados por vibraciones" },
            { name: "Control de presencia de adhesivos y placas de señalización eléctrica (1) y del adhesivo amarillo de emergencia (2) bajo cada botón de la instalación", system: "Señalización / seguridad", frequency: "H (600)", type: "Preventivo", acceptance: "Placas y adhesivos presentes y claramente legibles" },
            { name: "Lubricación de los movimientos de pre-punción: detener la máquina con el pulsador de paro, desenroscar los tapones de protección (1) y lubricar", system: "Grupo prepunzones (M4A15401010-1.1)", frequency: "H (300) - OIL (B)", type: "Preventivo", acceptance: "Utilizar lubricante de tipo B" },
            { name: "Limpieza y control del grupo unión de película de FORMACIÓN: eliminar restos de film y/o cinta adhesiva de las superficies (1) y orificios de aspiraci", system: "Grupo unión película de formación (M4A22300630-1.1)", frequency: "H (600)", type: "Preventivo", acceptance: "Superficies y orificios de aspiración libres de residuos; hoja de corte deslizante" },
            { name: "Limpieza del movimiento de la cortadora del grupo unión: limpiar con pincel y solución detergente de base natural el eje (1) de la cortadora y a fondo", system: "Grupo unión película de formación (M4A22300630-1.1)", frequency: "H (3600)", type: "Preventivo", acceptance: "NO lubricar después de la limpieza" },
            { name: "Limpieza de la superficie externa de los rodillos de reenvío de la película de formación (1) con paño y solución detergente ligera", system: "Grupo unión película de formación (M4A22300630-1.1)", frequency: "H (600)", type: "Preventivo", acceptance: "Superficie exterior limpia" },
            { name: "Limpieza y control del grupo empalme de película de COBERTURA: eliminar restos de film y/o cinta adhesiva de las superficies (1) y orificios de aspira", system: "Grupo unión película de cobertura (M4A22300720-1.1)", frequency: "H (600)", type: "Preventivo", acceptance: "Superficies y orificios de aspiración libres de residuos" },
            { name: "Limpieza del movimiento de la cortadora del grupo unión de cobertura: eje (1) de la cortadora y las dos ranuras laterales (2) con pincel y detergente ", system: "Grupo unión película de cobertura (M4A22300720-1.1)", frequency: "H (3600)", type: "Preventivo", acceptance: "NO lubricar después de la limpieza" },
            { name: "Limpieza de la superficie externa de los rodillos desviadores de película (1) con paño humedecido en detergente neutro y secado con paño seco y limpio", system: "Rodillos desviadores (M4A25402820-1.1)", frequency: "H (300)", type: "Preventivo", acceptance: "Superficie limpia y seca" },
            { name: "Limpieza de la telecámara: levantar la campana (1) hasta el bloqueo mecánico (2), aspirar los restos de polvo y limpiar con paño suave y limpio las su", system: "Sistema de visión / telecámara (M4A52302020-1.1)", frequency: "H (300)", type: "Preventivo", acceptance: "Óptica, iluminador y superficies reflectantes libres de polvo" },
            { name: "Comprobación del nivel de aceite en la caja de perforación con la máquina parada entre 5 y 30 minutos; relleno quitando la tapa (A); mantenimiento ext", system: "Caja de perforación (M4A65400160-1.1)", frequency: "H (1800) - OIL (A)", type: "Preventivo", acceptance: "El nivel no debe descender por debajo de la banda amarilla (1) ni rebasarla al rellenar; recipiente de recogida de aproximadamente 4 litros" },
            { name: "Limpieza y lubricación de los engranajes de transmisión traseros (1 y 2): desengrasar con brocha (3) y solución detergente de base natural, secar con ", system: "Grupo de perforación (M4A65400160-1.1)", frequency: "H (900) - OIL (B)", type: "Preventivo", acceptance: "Utilizar exclusivamente grasa de tipo B y aplicar con moderación" },
            { name: "Control del desgaste del perfil dentado de los engranajes de transmisión (1 y 2) del grupo de perforación (3)", system: "Grupo de perforación (M4A65400160-1.1)", frequency: "H (3600)", type: "Preventivo", acceptance: "No deben presentar dientes rotos ni deformados; si están dañados, sustituirlos siguiendo el procedimiento de remontaje con alineaciones A y B" },
            { name: "Control de las suspensiones (1) y de los tacos de goma (2) del dispositivo vibratorio de la taza vibratoria", system: "Taza vibratoria (M4G06204E10-1.1)", frequency: "H (1800)", type: "Preventivo", acceptance: "Comprobar integridad y fijación; sustituir las partes deformadas" },
            { name: "Control del estado de desgaste de la correa (1) de la taza vibratoria", system: "Taza vibratoria (M4G06204E10-1.1)", frequency: "H (3600)", type: "Preventivo", acceptance: "En caso de desgaste precoz, comprobar el perfil de las poleas correspondientes antes de montar la correa nueva" },
            { name: "Control del desgaste de las paletas de alimentación de comprimidos: girar manualmente la estrella de alimentación (1) y comprobar el perfil de cada pa", system: "Alimentación de comprimidos (M4G12107720-1.1)", frequency: "H (300)", type: "Preventivo", acceptance: "Si es necesario, desmontar la estrella y sustituir las paletas dañadas" },
            { name: "Limpieza del dispositivo de arrastre: desmontar el grupo tapa/calota (1) de la pared de la máquina y limpiar con brocha y chorro de aire comprimido lo", system: "Alimentación de comprimidos (M4G12107720-1.1)", frequency: "H (300)", type: "Preventivo", acceptance: "Perfiles de arrastre libres de residuos" },
            { name: "Limpieza y lubricación de las guías de la cabeza de alimentación: aflojar los tornillos (1), extraer la pared (2) hacia el exterior, limpiar las guías", system: "Cabeza de alimentación (M4G12400720-2.1)", frequency: "H (600) - OIL (O)", type: "Preventivo", acceptance: "El texto italiano indica grasa tipo O y el texto español indica grasa de tipo D en el mismo punto (discrepancia del manual); frecuencia H(600)" },
            { name: "Limpieza y lubricación del movimiento de abertura de la pared (4.27.2)", system: "Pared móvil / ejes de abertura", frequency: "H (3600) - OIL (B)", type: "Preventivo", acceptance: "Aflojar los tornillos (1) y extraer la pared (2) hacia el exterior; limpiar los ejes (4) con una brocha (3) mojada en solución detergente a base natur" },
            { name: "Remontaje de motores y reductores (4.27.3)", system: "Motorreductores", frequency: "Según necesidad (al volver a", type: "Preventivo", acceptance: "Realizar el ensamblaje verticalmente para optimizar la alineación entre las partes en movimiento." },
            { name: "Comprobación del apretado de los tornillos de acoplamiento motor-reductor (4.27.4)", system: "Motorreductores", frequency: "H (1200)", type: "Preventivo", acceptance: "Quitar el tapón (1) y, con llave dinamométrica calibrada a 11 Nm, comprobar el apretado del tornillo interno (2) de acoplamiento motor / reductor." },
            { name: "Limpieza y control del desgaste del cepillo giratorio (4.27.5)", system: "Recorrido de alimentación", frequency: "H (300)", type: "Preventivo", acceptance: "Desmontar el grupo del recorrido de alimentación; limpiar los cepillos (1) con aire comprimido y controlar el desgaste. Sustituir el cepillo cuando la" },
            { name: "Control del desgaste de la correa de transmisión (4.28.1) — grupo M4G18104820-1.1", system: "Transmisión por correa del grupo de alimentación", frequency: "H (1800)", type: "Preventivo", acceptance: "Desmontar la tapa delantera (1) y comprobar el grado de desgaste de la correa (2): no debe presentar grietas y/o deformaciones. En caso de desgaste pr" },
            { name: "Limpieza y control del desgaste de las escobillas giratorias (4.28.2) — grupo M4G18104820-1.1", system: "Recorrido de alimentación", frequency: "H (300)", type: "Preventivo", acceptance: "Desmontar el grupo del recorrido de alimentación y las coberturas (1); limpiar las escobillas (2) con aire comprimido y controlar el desgaste. Para su" },
            { name: "Control del desgaste de la correa de transporte (4.29.1) — grupo M4G75102320-2.1", system: "Transportador de blísteres", frequency: "H (900)", type: "Preventivo", acceptance: "La correa de transporte (1) no debe presentar grietas ni deformaciones en el dorso ni en el perfil dentado. En caso de desgaste precoz, antes de monta" },
            { name: "Control del tensado de la correa de transporte (4.29.2) — grupo M4G75102320-2.1", system: "Transportador de blísteres", frequency: "H (1800)", type: "Preventivo", acceptance: "La excursión de la correa (1) en el punto indicado no debe rebasar los 30 milímetros (comprobar como ilustra la figura, sin exceder con la carga). Si " },
            { name: "Procedimiento de desmontaje de la correa de transporte de blísteres (4.29.3, partes 1 a 13)", system: "Transportador de blísteres — grupo M4G75102320-2.1", frequency: "Según necesidad (sustitución", type: "Preventivo", acceptance: "Parte 1 (pág. 184): efectuar la SINCRONIZACIÓN; con el diente del blíster (1) y las marcas (2 y 3) alineados, parar con el pulsador de STOP y desmonta" },
            { name: "Procedimiento de montaje de la correa de transporte de blísteres (4.29.4)", system: "Transportador de blísteres — grupo M4G75102320-2.1", frequency: "Según necesidad (sustitución", type: "Preventivo", acceptance: "Colocar la correa nueva (1) como muestra la figura; montar y bloquear el tubo de sujeción (2). Desmontar y extraer el tubo (3) y terminar de introduci" },
            { name: "Control del tensado de las cadenas de movimiento cicloide (4.5.2)", system: "Grupo cicloide", frequency: "H (1800 h)", type: "Preventivo", acceptance: "Oscilación máxima 15 mm; ajustar con tensores (3 y 4)" },
            { name: "Comprobación del tensado de la cadena de motorización del transportador de salida (4.5.3)", system: "Transportador de salida", frequency: "H (1800 h)", type: "Preventivo", acceptance: "Oscilación máxima 10 mm; ajustar con tensador (2)" },
            { name: "Limpieza de conductos de aspiración (4.5.4)", system: "Vacío / cicloide", frequency: "H (900 h)", type: "Preventivo", acceptance: "Desempalmar el tubo de la conexión de vacío (1), soplar aire comprimido, girar el grupo cicloide (2) y soplar de nuevo; volver a empalmar el tubo" },
            { name: "Limpieza del distribuidor de vacío (4.5.5)", system: "Vacío / cicloide", frequency: "H (1800 h)", type: "Preventivo", acceptance: "Marcar referencias de fase rotor-distribuidor y muescas en engranajes (5 y 6) antes de desmontar; limpiar con aire comprimido la superficie externa de" },
            { name: "Comprobación del desgaste de los engranajes del cicloide (4.5.6)", system: "Grupo cicloide", frequency: "H (3600 h)", type: "Preventivo", acceptance: "Desmontar la placa delantera (1) y comprobar el perfil dentado de los engranajes internos (2, 3 y 4); sustituir los dañados" },
            { name: "Limpieza y lubricación de la leva de mando de extracción de blíster (4.5.7)", system: "Extracción de blíster", frequency: "H (900 h) - OIL (B)", type: "Preventivo", acceptance: "Desengrasar el perfil de la leva (2) con brocha y detergente natural, secar y lubricar con grasa tipo B" },
            { name: "Remontaje de motor y reductor (4.5.8)", system: "Motorización cicloide", frequency: "Según necesidad", type: "Preventivo", acceptance: "Ensamblar en vertical para optimizar la alineación entre partes en movimiento" },
            { name: "Comprobación del apretado de los tornillos de acoplamiento motor-reductor (4.5.9)", system: "Motorización cicloide", frequency: "H (1200 h)", type: "Preventivo", acceptance: "Quitar el tapón (1); par 6 Nm en el tornillo interno (2)" },
            { name: "Comprobación del desgaste de las ventosas de toma de blíster (4.5.10)", system: "Toma de blíster", frequency: "H (300 h)", type: "Preventivo", acceptance: "Sin grietas ni deformaciones; sustituir siempre las DOS ventosas de cada brazo" },
            { name: "Sustitución preventiva de las ventosas de toma (4.5.11)", system: "Toma de blíster", frequency: "M (6 meses)", type: "Preventivo", acceptance: "Sustituir todas las ventosas (1) aunque no haya desgaste evidente y anotar la fecha" },
            { name: "Control del desgaste de la correa de motorización de la cinta de salida (4.5.12)", system: "Cinta de salida", frequency: "H (1800 h)", type: "Preventivo", acceptance: "Sin grietas ni deformaciones; al sustituir, controlar el perfil dentado de las poleas" },
            { name: "Remontaje de motor y reductor del descarte motorizado (4.5.13)", system: "Descarte motorizado", frequency: "Según necesidad", type: "Preventivo", acceptance: "Ensamblaje vertical para optimizar la alineación" },
            { name: "Control del apretado del tornillo de acoplamiento motor-reductor del descarte motorizado (4.5.14)", system: "Descarte motorizado", frequency: "H (1200 h)", type: "Preventivo", acceptance: "Quitar el tapón (1); par 5 Nm en el tornillo (2)" },
            { name: "Limpieza del rodillo de desenrollado de la película de formación (4.6.1)", system: "Desbobinado film de formación (M4M25100930-1.1)", frequency: "H (300 h)", type: "Preventivo", acceptance: "Paño limpio con solución detergente suave; PROHIBIDO alcohol y disolventes" },
            { name: "Control del desgaste del rodillo de desenrollado de la película de formación (4.6.2)", system: "Desbobinado film de formación", frequency: "H (300 h)", type: "Preventivo", acceptance: "El rodillo de arrastre (1) no debe presentar grietas ni deformaciones; sustituir si es necesario" },
            { name: "Sustitución preventiva del rodillo de desenrollado de la película de formación (4.6.3)", system: "Desbobinado film de formación", frequency: "M (6 meses)", type: "Preventivo", acceptance: "Sustituir el rodillo engomado (1) por uno nuevo aunque no haya desgaste evidente; anotar la fecha" },
            { name: "Remontaje de motor y reductor (4.6.4)", system: "Desbobinado film de formación", frequency: "Según necesidad", type: "Preventivo", acceptance: "Ensamblaje vertical para optimizar la alineación" },
            { name: "Comprobación del apretado del tornillo de acoplamiento motor-reductor (4.6.5)", system: "Desbobinado film de formación", frequency: "H (1200 h)", type: "Preventivo", acceptance: "Quitar el tapón (1); par 5 Nm en el tornillo (2)" },
            { name: "Limpieza de los rodillos de reenvío de la película de formación (4.7.1)", system: "Reenvío film de formación (M4M25200540-1.1)", frequency: "H (300 h)", type: "Preventivo", acceptance: "Paño con solución detergente suave sobre la superficie externa de los rodillos (1)" },
            { name: "Control del desgaste del rodillo de arrastre de la película de formación (4.7.2)", system: "Reenvío film de formación", frequency: "H (300 h)", type: "Preventivo", acceptance: "No debe estar agrietado ni deformado; sustituir el rodillo engomado dañado (2)" },
            { name: "Sustitución preventiva del rodillo de desenrollado de la película de formación (4.7.3)", system: "Reenvío film de formación", frequency: "M (6 meses)", type: "Preventivo", acceptance: "Sustituir el rodillo engomado (1) por uno nuevo (2); anotar la fecha" },
            { name: "Control del desgaste del acoplamiento de goma (4.8.1)", system: "Precalentamiento (M4M30101640-1.1)", frequency: "H (1800 h)", type: "Preventivo", acceptance: "Sin juego al girar las semijuntas (1 y 2) en sentido contrario; mantener distancia mínima 1/2 mm entre semijuntas; sustituir el inserto (3) si hay apl" },
            { name: "Limpieza y lubricación del movimiento de placas de precalentamiento (4.8.2)", system: "Precalentamiento", frequency: "H (900 h) - OIL (B)", type: "Preventivo", acceptance: "Limpiar la leva (1) con brocha y detergente natural, secar y lubricar el perfil interno solo con grasa tipo B" },
            { name: "Limpieza de la guía de las placas de precalentamiento (4.8.3)", system: "Precalentamiento", frequency: "H (600 h)", type: "Preventivo", acceptance: "Limpiar la guía (2) con brocha y detergente natural girando manualmente la junta (3) de la motorización para alcanzar todos los puntos; secar y NO lub" },
            { name: "Limpieza de las placas de precalentamiento (4.8.4)", system: "Precalentamiento", frequency: "H (300 h)", type: "Preventivo", acceptance: "Esperar el enfriamiento total, desconectar los cables (3 y 4), aflojar las perillas (5 y 6) y sacar las placas (1 y 2). Partes revestidas (7 y 8) solo" },
            { name: "Control de eficiencia de los termorreguladores de precalentamiento (4.8.5)", system: "Precalentamiento", frequency: "H (1800 h)", type: "Preventivo", acceptance: "Con máquina en Producción Normal y temperatura de la ficha de formato, esperar 10 minutos y medir con sonda en los tornillos especiales (4 y 5) y en l" },
            { name: "Control del ajuste de la junta elástica del motor (4.8.6)", system: "Precalentamiento", frequency: "H (1800 h)", type: "Preventivo", acceptance: "Junta (A) a tope mecánico (B) en el árbol motor; tornillo (2) apretado con dinamométrica al valor de la figura" },
            { name: "Lubricación de los movimientos de la matriz (4.9.1)", system: "Formado / matriz (M4M35101810-2.1)", frequency: "H (300 h) - OIL (B)", type: "Preventivo", acceptance: "Máquina parada con el pulsador (1); desenroscar los tapones (2, 3 y 4) e inyectar grasa tipo B en los tres engrasadores (5) con jeringa adecuada (6)" },
            { name: "Limpieza y control de las placas de formado (4.9.2)", system: "Formado", frequency: "H (300 h)", type: "Preventivo", acceptance: "Desmontar las placas (1 y 2), quitar grumos y residuos plásticos sin herramientas metálicas y comprobar integridad de perfiles y superficies" },
            { name: "Control del ajuste de la junta elástica del motor de formado (4.9.3)", system: "Formado", frequency: "Según necesidad", type: "Preventivo", acceptance: "Junta (A) a tope mecánico (B); número '5' hacia el lado reductor (3); alinear diente lado motor con alojamiento lado reductor; lubricar ligeramente di" },
            { name: "Control y mantenimiento del reductor (4.9.4)", system: "Formado", frequency: "H (600 h)", type: "Preventivo", acceptance: "Comprobar visualmente la integridad del sello de aceite (1) y detectar posibles pérdidas de lubricante" }
          ],
          failureModes: [
            {
              name: "Cristal de los medidores de flujo (flusostatos) sucio, sin ver el líquido interno", probableSystem: "Sistema de refrigeración", status: "Base manual consolidada",
              symptoms: ["No se ve el líquido del circuito a través del cristal (1) del flusostato"],
              checks: ["Suciedad e incrustaciones en el interior del circuito de refrigeración"],
              correction: "Prolongar el tiempo de lavado del circuito o apagar el sistema centralizado, cerrar las llaves de entrada y salida, quitar los tornillos (4) de la tapa (5), extraer el interior hacia arriba, lavar tod",
              steps: [{ title: "Causa y solución", where: "Sistema de refrigeración", how: "Suciedad e incrustaciones en el interior del circuito de refrigeración", spec: null, tool: null, ifFail: "Prolongar el tiempo de lavado del circuito o apagar el sistema centralizado, cerrar las llaves de entrada y salida, quitar los tornillos (4) de la tapa (5), extraer el interior hacia arriba, lavar tod" }]
            },
            {
              name: "Agua excesivamente espumosa al vaciar tras el aclarado", probableSystem: "Sistema de refrigeración", status: "Base manual consolidada",
              symptoms: ["El agua de vaciado sale con demasiada espuma"],
              checks: ["Restos de fluido de lavado dentro del circuito"],
              correction: "Vaciar y volver a llenar el sistema con agua limpia y repetir el aclarado",
              steps: [{ title: "Causa y solución", where: "Sistema de refrigeración", how: "Restos de fluido de lavado dentro del circuito", spec: null, tool: null, ifFail: "Vaciar y volver a llenar el sistema con agua limpia y repetir el aclarado" }]
            },
            {
              name: "Filtro del circuito de refrigeración deteriorado", probableSystem: "Filtro de refrigeración R329000301-1.3", status: "Base manual consolidada",
              symptoms: ["Pérdida de líquido o deterioro evidente del filtro"],
              checks: ["Desgaste o daño del cuerpo de filtro"],
              correction: "Sustituir el filtro completo",
              steps: [{ title: "Causa y solución", where: "Filtro de refrigeración R329000301-1.3", how: "Desgaste o daño del cuerpo de filtro", spec: null, tool: null, ifFail: "Sustituir el filtro completo" }]
            },
            {
              name: "Engranajes del grupo de perforación con dientes rotos o deformados", probableSystem: "Grupo de perforación", status: "Base manual consolidada",
              symptoms: ["Perfil dentado dañado en los engranajes (1 y 2) del grupo de perforación (3)"],
              checks: ["Desgaste, falta de lubricación o holgura mal regulada del engranaje loco"],
              correction: "Sustituir los engranajes dañados siguiendo la secuencia de montaje con alineaciones A y B y regular la holgura del engranaje loco con la banda de papel fino",
              steps: [{ title: "Causa y solución", where: "Grupo de perforación", how: "Desgaste, falta de lubricación o holgura mal regulada del engranaje loco", spec: null, tool: null, ifFail: "Sustituir los engranajes dañados siguiendo la secuencia de montaje con alineaciones A y B y regular la holgura del engranaje loco con la banda de papel fino" }]
            },
            {
              name: "Desgaste precoz de la correa de la taza vibratoria", probableSystem: "Taza vibratoria M4G06204E10-1.1", status: "Base manual consolidada",
              symptoms: ["La correa (1) se desgasta antes de lo previsto"],
              checks: ["Perfil dentado de las poleas dañado o desgastado"],
              correction: "Antes de montar la correa nueva, comprobar el perfil dentado de las poleas correspondientes",
              steps: [{ title: "Causa y solución", where: "Taza vibratoria M4G06204E10-1.1", how: "Perfil dentado de las poleas dañado o desgastado", spec: null, tool: null, ifFail: "Antes de montar la correa nueva, comprobar el perfil dentado de las poleas correspondientes" }]
            },
            {
              name: "Placas identificativas de componentes o tiras numeradas de cables extraviadas", probableSystem: "Instalación eléctrica", status: "Base manual consolidada",
              symptoms: ["Componente o cable sin identificación"],
              checks: ["Pérdida de la placa/tira o composición incompleta"],
              correction: "Localizar de inmediato el componente o cable anónimo en el esquema eléctrico y volver a etiquetarlo o numerarlo",
              steps: [{ title: "Causa y solución", where: "Instalación eléctrica", how: "Pérdida de la placa/tira o composición incompleta", spec: null, tool: null, ifFail: "Localizar de inmediato el componente o cable anónimo en el esquema eléctrico y volver a etiquetarlo o numerarlo" }]
            },
            {
              name: "Paletas de alimentación de comprimidos con perfil dañado", probableSystem: "Alimentación de comprimidos M4G12107720-1.1", status: "Base manual consolidada",
              symptoms: ["Perfil de las paletas (2) deteriorado al girar manualmente la estrella (1)"],
              checks: ["Desgaste por rozamiento del producto"],
              correction: "Desmontar la estrella y sustituir las paletas estropeadas; comprobar además la limpieza y fijación del sensor de carga mínima (3)",
              steps: [{ title: "Causa y solución", where: "Alimentación de comprimidos M4G12107720-1.1", how: "Desgaste por rozamiento del producto", spec: null, tool: null, ifFail: "Desmontar la estrella y sustituir las paletas estropeadas; comprobar además la limpieza y fijación del sensor de carga mínima (3)" }]
            },
            {
              name: "Rodillo de arrastre de película agrietado o deformado", probableSystem: "Arrastre de película", status: "Base manual consolidada",
              symptoms: ["Grietas y/o deformaciones en el rodillo (1)"],
              checks: ["Desgaste del engomado"],
              correction: "Sustituir el rodillo; en cualquier caso sustitución preventiva cada 6 meses",
              steps: [{ title: "Causa y solución", where: "Arrastre de película", how: "Desgaste del engomado", spec: null, tool: null, ifFail: "Sustituir el rodillo; en cualquier caso sustitución preventiva cada 6 meses" }]
            },
            {
              name: "Desgaste precoz de la correa (de transmisión o de transporte)", probableSystem: "Transmisión por correa / transportador de blísteres", status: "Base manual consolidada",
              symptoms: ["La correa presenta grietas y/o deformaciones en el dorso o en el perfil dentado antes de lo previsto."],
              checks: ["Perfil dentado de las poleas dañado o desgastado."],
              correction: "Antes de volver a montar la correa nueva, controlar el perfil dentado de las poleas correspondientes y sustituirlas si están dañadas.",
              steps: [{ title: "Causa y solución", where: "Transmisión por correa / transportador de blísteres", how: "Perfil dentado de las poleas dañado o desgastado.", spec: null, tool: null, ifFail: "Antes de volver a montar la correa nueva, controlar el perfil dentado de las poleas correspondientes y sustituirlas si están dañadas." }]
            },
            {
              name: "Excursión excesiva de la correa de transporte", probableSystem: "Transportador de blísteres — grupo M4G75102320-2.1", status: "Base manual consolidada",
              symptoms: ["La correa del transportador rebasa los 30 mm de excursión en el punto de comprobación."],
              checks: ["Pérdida de tensado de la correa."],
              correction: "Aflojar las tuercas (2 y 3) e intervenir simétricamente en los tornillos (4 y 5) en la medida apenas suficiente para eliminar el desplazamiento excesivo; volver a apretar las tuercas (2 y 3).",
              steps: [{ title: "Causa y solución", where: "Transportador de blísteres — grupo M4G75102320-2.1", how: "Pérdida de tensado de la correa.", spec: null, tool: null, ifFail: "Aflojar las tuercas (2 y 3) e intervenir simétricamente en los tornillos (4 y 5) en la medida apenas suficiente para eliminar el desplazamiento excesivo; volver a apretar las tuercas (2 y 3)." }]
            },
            {
              name: "El producto no se orienta correctamente", probableSystem: "Recorrido de alimentación (cepillo giratorio)", status: "Base manual consolidada",
              symptoms: ["Las cerdas del cepillo ya no logran orientar el producto."],
              checks: ["Desgaste de las cerdas del cepillo giratorio."],
              correction: "Sustituir el cepillo. Limpiar previamente con aire comprimido y controlar el grado de desgaste cada H (300).",
              steps: [{ title: "Causa y solución", where: "Recorrido de alimentación (cepillo giratorio)", how: "Desgaste de las cerdas del cepillo giratorio.", spec: null, tool: null, ifFail: "Sustituir el cepillo. Limpiar previamente con aire comprimido y controlar el grado de desgaste cada H (300)." }]
            },
            {
              name: "Dientes de empuje del transportador dañados o flojos", probableSystem: "Transportador de blísteres", status: "Base manual consolidada",
              symptoms: ["Dientes de empuje no íntegros, no perpendiculares a la correa o mal sujetos."],
              checks: ["Desgaste, golpes o aflojamiento de la fijación."],
              correction: "Comprobar la integridad de todos los dientes de empuje (2) cada H (900); deben estar íntegros, perpendiculares a la correa y bien sujetos; sustituir o fijar los defectuosos.",
              steps: [{ title: "Causa y solución", where: "Transportador de blísteres", how: "Desgaste, golpes o aflojamiento de la fijación.", spec: null, tool: null, ifFail: "Comprobar la integridad de todos los dientes de empuje (2) cada H (900); deben estar íntegros, perpendiculares a la correa y bien sujetos; sustituir o fijar los defectuosos." }]
            },
            {
              name: "Desalineación entre motor y reductor tras el remontaje", probableSystem: "Motorreductores", status: "Base manual consolidada",
              symptoms: ["Mala alineación entre las partes en movimiento después de un remontaje."],
              checks: ["Ensamblaje realizado en posición no vertical."],
              correction: "Realizar el ensamblaje del motor (1) y/o del reductor (2) verticalmente para optimizar la alineación entre las partes en movimiento.",
              steps: [{ title: "Causa y solución", where: "Motorreductores", how: "Ensamblaje realizado en posición no vertical.", spec: null, tool: null, ifFail: "Realizar el ensamblaje del motor (1) y/o del reductor (2) verticalmente para optimizar la alineación entre las partes en movimiento." }]
            },
            {
              name: "No se alcanza la temperatura programada en las placas de precalentamiento", probableSystem: "Precalentamiento / termorreguladores", status: "Base manual consolidada",
              symptoms: ["Tras esperar 10 minutos con el termorregulador en consigna, la sonda no mide la temperatura prestablecida por el formato"],
              checks: ["Conexiones eléctricas defectuosas de la resistencia o de la sonda"],
              correction: "Controlar las conexiones según el esquema eléctrico",
              steps: [{ title: "Causa y solución", where: "Precalentamiento / termorreguladores", how: "Conexiones eléctricas defectuosas de la resistencia o de la sonda", spec: null, tool: null, ifFail: "Controlar las conexiones según el esquema eléctrico" }]
            },
            {
              name: "Juego excesivo en el acoplamiento de goma de la motorización de precalentamiento", probableSystem: "Precalentamiento - junta elástica", status: "Base manual consolidada",
              symptoms: ["Al girar manualmente las semijuntas en sentido contrario se aprecia juego; el acoplamiento central de goma queda aplastado"],
              checks: ["Desgaste/aplastamiento del inserto central de goma"],
              correction: "Sustituir el acoplamiento de goma y mantener una distancia mínima de 1/2 mm entre las dos semijuntas",
              steps: [{ title: "Causa y solución", where: "Precalentamiento - junta elástica", how: "Desgaste/aplastamiento del inserto central de goma", spec: null, tool: null, ifFail: "Sustituir el acoplamiento de goma y mantener una distancia mínima de 1/2 mm entre las dos semijuntas" }]
            },
            {
              name: "Desgaste prematuro de los punzones de codificación", probableSystem: "Codificación", status: "Base manual consolidada",
              symptoms: ["Punzones desgastados antes de tiempo"],
              checks: ["Hacer girar la máquina en vacío con los punzones montados"],
              correction: "No hacer girar la máquina en vacío con los punzones montados; extraer las cabezas de codificación (2 y 3) aflojando los bornes (1) para inspección",
              steps: [{ title: "Causa y solución", where: "Codificación", how: "Hacer girar la máquina en vacío con los punzones montados", spec: null, tool: null, ifFail: "No hacer girar la máquina en vacío con los punzones montados; extraer las cabezas de codificación (2 y 3) aflojando los bornes (1) para inspección" }]
            },
            {
              name: "El diseño de la medida escapa hacia la parte externa del objeto medido", probableSystem: "Visión - parámetros de medida", status: "Base manual consolidada",
              symptoms: ["En la prueba de medida el contorno dibujado se aleja del borde del producto"],
              checks: ["Valor del Contraste de Medida demasiado alto"],
              correction: "Reducir el valor del contraste de medida (el manual muestra ejemplos con contraste 10, 15, 25 y 50)",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros de medida", how: "Valor del Contraste de Medida demasiado alto", spec: null, tool: null, ifFail: "Reducir el valor del contraste de medida (el manual muestra ejemplos con contraste 10, 15, 25 y 50)" }]
            },
            {
              name: "El diseño de la medida tiende a quedarse dentro del objeto", probableSystem: "Visión - parámetros de medida", status: "Base manual consolidada",
              symptoms: ["El contorno dibujado no alcanza el borde real del producto"],
              checks: ["Valor del Contraste de Medida demasiado bajo"],
              correction: "Aumentar el valor del contraste de medida",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros de medida", how: "Valor del Contraste de Medida demasiado bajo", spec: null, tool: null, ifFail: "Aumentar el valor del contraste de medida" }]
            },
            {
              name: "Contorno irregular por escaso contraste en el borde y superficie no homogénea", probableSystem: "Visión - parámetros especiales de medida", status: "Base manual consolidada",
              symptoms: ["Detección de un contorno irregular del comprimido"],
              checks: ["Contraste de medida bajo a causa del escaso contraste en el borde del producto y, simultáneamente, superficie del comprimido no homogénea"],
              correction: "Usar el parámetro Dimensión del Alrededor de Validación de los Puntos del Contorno para sondear una zona alrededor de cada punto del contorno y asegurar su validez",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de medida", how: "Contraste de medida bajo a causa del escaso contraste en el borde del producto y, simultáneamente, superficie del comprimido no homogénea", spec: null, tool: null, ifFail: "Usar el parámetro Dimensión del Alrededor de Validación de los Puntos del Contorno para sondear una zona alrededor de cada punto del contorno y asegurar su validez" }]
            },
            {
              name: "El diseño del contorno escapa hacia fuera en pocos puntos aislados", probableSystem: "Visión - parámetros especiales de medida", status: "Base manual consolidada",
              symptoms: ["Ocasionalmente aparecen porciones del contorno despegadas del borde del producto"],
              checks: ["Falta de contraste en el borde de algunos productos"],
              correction: "Aplicar el Vínculo de Continuidad del Contorno, que regulariza el contorno cortando las porciones que se despegan de forma anormal del borde del producto",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de medida", how: "Falta de contraste en el borde de algunos productos", spec: null, tool: null, ifFail: "Aplicar el Vínculo de Continuidad del Contorno, que regulariza el contorno cortando las porciones que se despegan de forma anormal del borde del producto" }]
            },
            {
              name: "Contorno corroído en cápsulas con inscripciones sobreimpresas", probableSystem: "Visión - parámetros especiales de medida", status: "Base manual consolidada",
              symptoms: ["El contorno resulta corroído en coincidencia con la impresión, con falta de repetitividad de la medida"],
              checks: ["Las inscripciones sobreimpresas se disponen casualmente a la vista de la cámara"],
              correction: "Aplicar el Vínculo de Convexidad del Contorno, que regulariza el contorno y permite la repetitividad de la medida",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de medida", how: "Las inscripciones sobreimpresas se disponen casualmente a la vista de la cámara", spec: null, tool: null, ifFail: "Aplicar el Vínculo de Convexidad del Contorno, que regulariza el contorno y permite la repetitividad de la medida" }]
            },
            {
              name: "Contraste no uniforme a lo largo del contorno", probableSystem: "Visión - parámetros especiales de medida", status: "Base manual consolidada",
              symptoms: ["Para el mismo objeto coexisten zonas más claras y más oscuras que el entorno en distintas porciones del contorno"],
              checks: ["El objeto a medir no es siempre más claro o más oscuro que su alrededor"],
              correction: "Activar la opción Contraste Irregular",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de medida", how: "El objeto a medir no es siempre más claro o más oscuro que su alrededor", spec: null, tool: null, ifFail: "Activar la opción Contraste Irregular" }]
            },
            {
              name: "Riesgo de mix-up entre comprimidos circulares y hexagonales (pentagonales)", probableSystem: "Visión - parámetros especiales de medida", status: "Base manual consolidada",
              symptoms: ["Comprimidos de distinta forma con la misma área e idéntico color no se distinguen"],
              checks: ["El parámetro usual Forma 2 no discrimina la geometría"],
              correction: "Sustituir el parámetro Forma 2 por otro parámetro habilitando la opción correspondiente; se usan las tolerancias de la Forma 2",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de medida", how: "El parámetro usual Forma 2 no discrimina la geometría", spec: null, tool: null, ifFail: "Sustituir el parámetro Forma 2 por otro parámetro habilitando la opción correspondiente; se usan las tolerancias de la Forma 2" }]
            },
            {
              name: "Escritura en el centro del comprimido que perturba la medida", probableSystem: "Visión - parámetros especiales de medida", status: "Base manual consolidada",
              symptoms: ["La medida se ve afectada por el texto impreso en el centro del comprimido"],
              checks: ["Zona central con contraste propio"],
              correction: "Definir la Dimensión de la Zona de Interdicción en el Centro del Producto (zona elíptica en pixel que se ignora durante la medida). Alternativamente cambiar la Dirección de Medida del Contorno para pr",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de medida", how: "Zona central con contraste propio", spec: null, tool: null, ifFail: "Definir la Dimensión de la Zona de Interdicción en el Centro del Producto (zona elíptica en pixel que se ignora durante la medida). Alternativamente cambiar la Dirección de Medida del Contorno para pr" }]
            },
            {
              name: "Superficie del comprimido no homogénea que dificulta la búsqueda", probableSystem: "Visión - parámetros especiales de búsqueda", status: "Base manual consolidada",
              symptoms: ["La búsqueda falla o es inestable"],
              checks: ["Superficie del producto no homogénea"],
              correction: "Usar el Nivel de Filtrado del Ruido antes de la búsqueda; se aconsejan valores inferiores a 5",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de búsqueda", how: "Superficie del producto no homogénea", spec: null, tool: null, ifFail: "Usar el Nivel de Filtrado del Ruido antes de la búsqueda; se aconsejan valores inferiores a 5" }]
            },
            {
              name: "No se detectan presencias múltiples (objetos dobles o fragmentos) en el alvéolo", probableSystem: "Visión - parámetros especiales de búsqueda", status: "Base manual consolidada",
              symptoms: ["El sistema individúa un solo objeto aunque haya varios"],
              checks: ["Nivel de Filtrado del Ruido en fase final demasiado alto: cuanto mayor es el valor del filtro, menos probable resulta la detección de objetos dobles o fragmentos múltiples; el valo"],
              correction: "Reducir el Nivel de Filtrado del Ruido (fase final 1 y 2)",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de búsqueda", how: "Nivel de Filtrado del Ruido en fase final demasiado alto: cuanto mayor es el valor del filtro, menos probable resulta la detección de objetos dobles o fragmentos múltiples; el valo", spec: null, tool: null, ifFail: "Reducir el Nivel de Filtrado del Ruido (fase final 1 y 2)" }]
            },
            {
              name: "Puntos cercanos al borde de la ventana falsean la posición (búsqueda 1D)", probableSystem: "Visión - parámetros especiales de búsqueda", status: "Base manual consolidada",
              symptoms: ["Posición del objeto calculada incorrectamente"],
              checks: ["Se usan para el cálculo puntos próximos al borde de la ventana de búsqueda"],
              correction: "Aplicar el Vínculo (1D), que impide que los puntos cercanos al borde de la ventana se usen para el cálculo de la posición",
              steps: [{ title: "Causa y solución", where: "Visión - parámetros especiales de búsqueda", how: "Se usan para el cálculo puntos próximos al borde de la ventana de búsqueda", spec: null, tool: null, ifFail: "Aplicar el Vínculo (1D), que impide que los puntos cercanos al borde de la ventana se usen para el cálculo de la posición" }]
            },
            {
              name: "Blísteres sobrepuestos a la salida", probableSystem: "PLC interno - controles sobre la cintita", status: "Base manual consolidada",
              symptoms: ["El detector 2 mide un tiempo de tránsito excesivo, superior a la tolerancia especificada"],
              checks: ["Dos blísteres salen sobrepuestos del cizallador"],
              correction: "Verificar la salida del cizallador; comprobar la Velocidad de la Cintita, la Longitud del blíster y la Tolerancia de los Tiempos de Tránsito para blísteres sobrepuestos",
              steps: [{ title: "Causa y solución", where: "PLC interno - controles sobre la cintita", how: "Dos blísteres salen sobrepuestos del cizallador", spec: null, tool: null, ifFail: "Verificar la salida del cizallador; comprobar la Velocidad de la Cintita, la Longitud del blíster y la Tolerancia de los Tiempos de Tránsito para blísteres sobrepuestos" }]
            },
            {
              name: "El detector 1 no ve el tránsito de todos los blísteres cortados", probableSystem: "PLC interno - controles sobre la cintita", status: "Base manual consolidada",
              symptoms: ["Alarma de control del detector 1 entre dos fases de corte"],
              checks: ["El intervalo de tiempo de control no está bien alineado con la llegada de los blísteres"],
              correction: "Retrasar la fase de corte con el campo Retraso (ms), que desplaza hacia adelante el intervalo de tiempo dentro del cual los blísteres cortados deben ser vistos por el detector 1",
              steps: [{ title: "Causa y solución", where: "PLC interno - controles sobre la cintita", how: "El intervalo de tiempo de control no está bien alineado con la llegada de los blísteres", spec: null, tool: null, ifFail: "Retrasar la fase de corte con el campo Retraso (ms), que desplaza hacia adelante el intervalo de tiempo dentro del cual los blísteres cortados deben ser vistos por el detector 1" }]
            },
            {
              name: "Los detectores no leen con precisión el frente del blíster", probableSystem: "PLC interno - descarte serial", status: "Base manual consolidada",
              symptoms: ["Medida de velocidad de la cintita poco fiable"],
              checks: ["Lectura imprecisa del frente del blíster por los dos primeros detectores"],
              correction: "Fijar la velocidad de la cintita mediante el valor numérico en lugar de dejar que se mida con los detectores",
              steps: [{ title: "Causa y solución", where: "PLC interno - descarte serial", how: "Lectura imprecisa del frente del blíster por los dos primeros detectores", spec: null, tool: null, ifFail: "Fijar la velocidad de la cintita mediante el valor numérico en lugar de dejar que se mida con los detectores" }]
            },
            {
              name: "Blísteres no descartados que llegan al almacén de la estuchadora", probableSystem: "PLC interno / colas de descarte", status: "Base manual consolidada",
              symptoms: ["Alarma por falta de descarte"],
              checks: ["Fallo del dispositivo de descarte o colas de descarte mal ajustadas"],
              correction: "Habilitar la Expulsión desde la Cintita de Salida de los Blísteres no Descartados (fuelle/soplo) para desviarlos; si la casilla no está marcada los blísteres no descartados van al almacén de la estuch",
              steps: [{ title: "Causa y solución", where: "PLC interno / colas de descarte", how: "Fallo del dispositivo de descarte o colas de descarte mal ajustadas", spec: null, tool: null, ifFail: "Habilitar la Expulsión desde la Cintita de Salida de los Blísteres no Descartados (fuelle/soplo) para desviarlos; si la casilla no está marcada los blísteres no descartados van al almacén de la estuch" }]
            },
            {
              name: "Parada indeseada por demasiados descartes al cerrar el cargador de comprimidos", probableSystem: "Parámetros de trabajo", status: "Base manual consolidada",
              symptoms: ["La máquina se para por descartes consecutivos cuando el cargador cambia de estado"],
              checks: ["La señal de inhibición del stop coincide con el estado del cargador (0 = abierto, 1 = cerrado) y el cargador está aguas arriba del sistema de control"],
              correction: "Programar el Retraso Inhibición Stop (pasos) con un número de pasos igual a la distancia entre el cargador y el sistema de control",
              steps: [{ title: "Causa y solución", where: "Parámetros de trabajo", how: "La señal de inhibición del stop coincide con el estado del cargador (0 = abierto, 1 = cerrado) y el cargador está aguas arriba del sistema de control", spec: null, tool: null, ifFail: "Programar el Retraso Inhibición Stop (pasos) con un número de pasos igual a la distancia entre el cargador y el sistema de control" }]
            },
            {
              name: "Variación del color de la luz por envejecimiento de las lámparas o luz ambiente", probableSystem: "Visión - ventanas cinta", status: "Base manual consolidada",
              symptoms: ["Deriva de las medidas de color"],
              checks: ["Cambio del color de la luz incidente"],
              correction: "Usar una Ventana de Referencia de Blanco sobre partes metálicas (guías de la cinta de formado) para balancear el color; el balance se efectúa por separado para cada imagen de cada cámara",
              steps: [{ title: "Causa y solución", where: "Visión - ventanas cinta", how: "Cambio del color de la luz incidente", spec: null, tool: null, ifFail: "Usar una Ventana de Referencia de Blanco sobre partes metálicas (guías de la cinta de formado) para balancear el color; el balance se efectúa por separado para cada imagen de cada cámara" }]
            },
            {
              name: "Descarte de todos los blísteres de una imagen por una sola ventana indicadora", probableSystem: "Visión - ventanas cinta / tolerancias cinta", status: "Base manual consolidada",
              symptoms: ["Descarte masivo sin defecto aparente del producto"],
              checks: ["Una ventana indicadora está fuera de tolerancia por uno o más parámetros; ello causa el descarte de todos los blísteres contenidos en las imágenes"],
              correction: "Revisar las Tolerancias Cinta y el estado de la zona donde está colocada la ventana indicadora; tener presente que cuanto menor es el área de la ventana, mayor es su sensibilidad a los defectos",
              steps: [{ title: "Causa y solución", where: "Visión - ventanas cinta / tolerancias cinta", how: "Una ventana indicadora está fuera de tolerancia por uno o más parámetros; ello causa el descarte de todos los blísteres contenidos en las imágenes", spec: null, tool: null, ifFail: "Revisar las Tolerancias Cinta y el estado de la zona donde está colocada la ventana indicadora; tener presente que cuanto menor es el área de la ventana, mayor es su sensibilidad a los defectos" }]
            },
            {
              name: "Alvéolo declarado vacío con color anómalo", probableSystem: "Visión - defectos críticos / otros defectos", status: "Base manual consolidada",
              symptoms: ["Un alvéolo que el algoritmo de búsqueda considera vacío presenta en realidad un color diferente del alvéolo vacío"],
              checks: ["Residuo, fragmento o cuerpo extraño en el alvéolo"],
              correction: "Ajustar la tolerancia del Control de los Alvéolos Vacíos (umbral de aceptación de las diferencias en los niveles de color); recordar que los niveles de color de los alvéolos vacíos se almacenan durant",
              steps: [{ title: "Causa y solución", where: "Visión - defectos críticos / otros defectos", how: "Residuo, fragmento o cuerpo extraño en el alvéolo", spec: null, tool: null, ifFail: "Ajustar la tolerancia del Control de los Alvéolos Vacíos (umbral de aceptación de las diferencias en los niveles de color); recordar que los niveles de color de los alvéolos vacíos se almacenan durant" }]
            },
            {
              name: "Longitud final del Shift Register distinta de la inicial", probableSystem: "Shift Registers", status: "Base manual consolidada",
              symptoms: ["Alarma al parar la máquina"],
              checks: ["Desequilibrio entre las operaciones de introducción y extracción de datos en el SR"],
              correction: "Revisar los eventos de entrada y salida del SR y usar la tecla Ajuste a cero para restablecer los valores iniciales al ocurrir la condición de iniciación",
              steps: [{ title: "Causa y solución", where: "Shift Registers", how: "Desequilibrio entre las operaciones de introducción y extracción de datos en el SR", spec: null, tool: null, ifFail: "Revisar los eventos de entrada y salida del SR y usar la tecla Ajuste a cero para restablecer los valores iniciales al ocurrir la condición de iniciación" }]
            },
            {
              name: "Retraso en la ejecución de la rutina del PLC interno", probableSystem: "PLC interno", status: "Base manual consolidada",
              symptoms: ["Alarma con parada de la máquina indicando el punto del código que ha causado el retraso y el retraso medido"],
              checks: ["Se ha superado el Intervalo máximo entre dos Ejecuciones Consecutivas del PLC (ms)"],
              correction: "Reducir la carga computacional (por ejemplo con la opción Construcción de las Imágenes, que reduce el tiempo de ciclo) y comunicar al servicio técnico el punto de código indicado",
              steps: [{ title: "Causa y solución", where: "PLC interno", how: "Se ha superado el Intervalo máximo entre dos Ejecuciones Consecutivas del PLC (ms)", spec: null, tool: null, ifFail: "Reducir la carga computacional (por ejemplo con la opción Construcción de las Imágenes, que reduce el tiempo de ciclo) y comunicar al servicio técnico el punto de código indicado" }]
            },
            {
              name: "Alarma de temperatura de placa madre o CPU (M037)", probableSystem: "PC del sistema de visión Harlequin", status: "Base manual consolidada",
              symptoms: ["Mensaje 'Alarma! Temperatura de la placa madre: X° (máx Y°)' o 'Alarma! Temperatura de la CPU: X° (máx Y°)'"],
              checks: ["Temperaturas superiores a los límites consentidos: filtros de aire sucios, ventiladores de refrigeración interna defectuosos o ventilador de enfriamiento de la CPU bloqueado."],
              correction: "Asegurarse de que los filtros del aire estén limpios, que los ventiladores que refrescan el aire en el interior de la máquina funcionen bien y que el ventilador de enfriamiento de la CPU no esté bloqu",
              steps: [{ title: "Causa y solución", where: "PC del sistema de visión Harlequin", how: "Temperaturas superiores a los límites consentidos: filtros de aire sucios, ventiladores de refrigeración interna defectuosos o ventilador de enfriamiento de la CPU bloqueado.", spec: null, tool: null, ifFail: "Asegurarse de que los filtros del aire estén limpios, que los ventiladores que refrescan el aire en el interior de la máquina funcionen bien y que el ventilador de enfriamiento de la CPU no esté bloqu" }]
            },
            {
              name: "Variación excesiva de luz / degradación del iluminador (M002)", probableSystem: "Iluminación y telecámara del sistema de visión", status: "Base manual consolidada",
              symptoms: ["La luminosidad de las ventanas de referencia de los niveles varía más del 50% respecto del valor aplicado"],
              checks: ["Deterioro de la lámpara, iluminador fuera de posición, movimiento de las ventanas de referencia de los niveles, variación de la luz ambiente o desperfecto en la telecámara."],
              correction: "Cambiar la lámpara o efectuar una nueva aplicación; verificar posición del iluminador, ventanas de referencia, luz ambiente y telecámara.",
              steps: [{ title: "Causa y solución", where: "Iluminación y telecámara del sistema de visión", how: "Deterioro de la lámpara, iluminador fuera de posición, movimiento de las ventanas de referencia de los niveles, variación de la luz ambiente o desperfecto en la telecámara.", spec: null, tool: null, ifFail: "Cambiar la lámpara o efectuar una nueva aplicación; verificar posición del iluminador, ventanas de referencia, luz ambiente y telecámara." }]
            },
            {
              name: "Falta de recepción de la señal de fase de adquisición (M031)", probableSystem: "Señales de sincronismo Harlequin – máquina", status: "Base manual consolidada",
              symptoms: ["Pasados 10 segundos desde el inicio de la máquina no llega la señal de fase"],
              checks: ["Desperfecto en el sensor de fase o su cableado."],
              correction: "Verificar el sensor/encoder de fase y su conexión a Harlequin.",
              steps: [{ title: "Causa y solución", where: "Señales de sincronismo Harlequin – máquina", how: "Desperfecto en el sensor de fase o su cableado.", spec: null, tool: null, ifFail: "Verificar el sensor/encoder de fase y su conexión a Harlequin." }]
            },
            {
              name: "La máquina no se detiene al bajar la marcha permitida (M032)", probableSystem: "Interfaz de parada Harlequin – máquina", status: "Base manual consolidada",
              symptoms: ["Pasados 10 segundos desde que baja la señal de marcha permitida, la máquina no se para"],
              checks: ["Desperfecto en la señal de marcha permitida o en su interfaz con el control de máquina."],
              correction: "Verificar el cableado y la lógica de la señal de marcha permitida.",
              steps: [{ title: "Causa y solución", where: "Interfaz de parada Harlequin – máquina", how: "Desperfecto en la señal de marcha permitida o en su interfaz con el control de máquina.", spec: null, tool: null, ifFail: "Verificar el cableado y la lógica de la señal de marcha permitida." }]
            },
            {
              name: "Obstrucción de la cortadora (M501)", probableSystem: "Cortadora y cintita de salida", status: "Base manual consolidada",
              symptoms: ["La fotocélula de la cintita de salida queda fija por más de 0,7 segundos"],
              checks: ["Blíster atascado obstruyendo la cintita de salida."],
              correction: "Liberar la cintita; verificar la fotocélula.",
              steps: [{ title: "Causa y solución", where: "Cortadora y cintita de salida", how: "Blíster atascado obstruyendo la cintita de salida.", spec: null, tool: null, ifFail: "Liberar la cintita; verificar la fotocélula." }]
            },
            {
              name: "Falta de descarte de blísteres (M502, M503, M539, M540)", probableSystem: "Sistema de descarte / contra control del PLC interno", status: "Base manual consolidada",
              symptoms: ["Blísteres de descarte que pasaron por la cintita de salida y llegaron a la estuchadora o al contenedor debajo de la cintita"],
              checks: ["El contra control del PLC interno (barrera o fibra óptica) detecta una condición de falta de descarte."],
              correction: "Controlar los blísteres cargados en la estuchadora y los caídos en el contenedor debajo de la cintita, retirarlos, y verificar el sistema de descarte y la calibración de la fibra óptica.",
              steps: [{ title: "Causa y solución", where: "Sistema de descarte / contra control del PLC interno", how: "El contra control del PLC interno (barrera o fibra óptica) detecta una condición de falta de descarte.", spec: null, tool: null, ifFail: "Controlar los blísteres cargados en la estuchadora y los caídos en el contenedor debajo de la cintita, retirarlos, y verificar el sistema de descarte y la calibración de la fibra óptica." }]
            },
            {
              name: "Fibra de contra control mal calibrada (M541)", probableSystem: "Contra control de fibra óptica del canal X (PLC Interno 1)", status: "Base manual consolidada",
              symptoms: ["Lee el paso de blísteres inexistentes: detecta el descarte de un blíster que en realidad no fue descartado"],
              checks: ["Mala calibración de la fibra óptica del canal X."],
              correction: "Recalibrar la fibra de contra control del canal X.",
              steps: [{ title: "Causa y solución", where: "Contra control de fibra óptica del canal X (PLC Interno 1)", how: "Mala calibración de la fibra óptica del canal X.", spec: null, tool: null, ifFail: "Recalibrar la fibra de contra control del canal X." }]
            },
            {
              name: "Blísteres adelantados o retrasados en la fotocélula de la cintita (M505, M506)", probableSystem: "Cintita de salida y fotocélula", status: "Base manual consolidada",
              symptoms: ["Tiempos de tránsito fuera de tolerancia sin detectarse falta de descarte ni obstrucción parcial"],
              checks: ["Cintita sucia o fotocélula descalibrada."],
              correction: "Limpiar la cintita y controlar la calibración de la fotocélula.",
              steps: [{ title: "Causa y solución", where: "Cintita de salida y fotocélula", how: "Cintita sucia o fotocélula descalibrada.", spec: null, tool: null, ifFail: "Limpiar la cintita y controlar la calibración de la fotocélula." }]
            }
          ],
          documents: [
            { name: "Calibrado y regulaciones (M4160012, 200 págs.)", status: "Disponible", file: "manuales/integra320/Integra320-calibrado-y-regulaciones.pdf" },
            { name: "Cambio de formato y optimización (M4160012)", status: "Disponible", file: "manuales/integra320/Integra320-cambio-de-formato.pdf" },
            { name: "Piezas de recambio (M4180017, 422 págs.)", status: "Disponible", file: "manuales/integra320/Integra320-piezas-de-recambio.pdf" },
            { name: "SEA Vision — Manual de usuario", status: "Disponible", file: "manuales/integra320/SEAVision-manual-usuario.pdf" },
            { name: "SEA Vision — Manual técnico (alarmas)", status: "Disponible", file: "manuales/integra320/SEAVision-manual-tecnico.pdf" },
            { name: "Manual de uso y mantenimiento de la máquina", status: "Pendiente" },
            { name: "Esquema eléctrico", status: "Pendiente" }
          ]
        }
      ];

      // ----- Registro de equipos (assets/equipos.js) -----
      const EQ_DATA = window.EQUIPOS_PLAN || null;
      const PLAN_EQUIPOS = EQ_DATA ? EQ_DATA.equipos : [];
      const EQ_POR_ID = new Map(PLAN_EQUIPOS.map((eq) => [eq.id, eq]));
      // Repuestos del registro que le tocan a una maquina (tenga ficha rica o basica).
      function equipoDeMachine(machine) { return machine ? EQ_POR_ID.get(machine.id) || null : null; }

      // Hay fichas cuyo código de equipo no aparece en los listados oficiales
      // DMM-179 (equipos nuevos, o un código mal copiado). Conviene que se vea:
      // si el código no está en el registro, ese equipo no tiene plan de
      // repuestos ni sale en los conteos de mantenimiento por sistemas.
      const EQ_POR_COD = new Map(PLAN_EQUIPOS.map((e) => [String(e.c), e]));
      function codigoEnRegistro(cod) { return !!cod && EQ_POR_COD.has(String(cod)); }
      function avisoCodigo(machine) {
        const cod = machine.equipoCod || "";
        if (!cod || codigoEnRegistro(cod)) return "";
        return `<span class="cod-aviso" title="Los listados oficiales son DMM-179B (Sede 4) y DMM-179 (Planta 2). Mientras el código no esté ahí, este equipo no tiene plan de repuestos importado.">Código ${planEsc(cod)} sin registrar en el listado oficial</span>`;
      }

      // Sync and load machines from localStorage
      const storageMachinesKey = "equipos-machines-v4";
      let machines = [];
      try {
        const stored = localStorage.getItem(storageMachinesKey);
        if (stored) {
          machines = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error loading machines from localStorage:", e);
      }
      if (!Array.isArray(machines) || machines.length === 0) {
        machines = initialMachines;
      } else {
        const storedById = Object.fromEntries(machines.map((m) => [m.id, m]));
        const baseIds = new Set(initialMachines.map((m) => m.id));
        machines = [
          ...initialMachines.map((base) => {
            const stored = storedById[base.id];
            if (!stored) return base;
            const userFailures = (stored.failureModes ?? []).filter((f) => f.status?.includes("Reportada"));
            return { ...base, failureModes: [...userFailures, ...(base.failureModes ?? [])] };
          }),
          ...machines.filter((m) => !baseIds.has(m.id))
        ];
      }

      // ======================================================================
      //  REGISTRO UNICO DE EQUIPOS
      //  Antes habia dos mundos: 5 maquinas con ficha y 80 filas de un Excel
      //  aparte. Ahora todo equipo es una maquina; las que ya tenian ficha rica
      //  simplemente tienen mas profundidad, y el resto nacen con lo basico.
      // ======================================================================
      // Todos los campos técnicos que pinta el resumen. Una ficha básica los trae
      // vacíos pero presentes: si falta alguno, la ficha escribe "undefined".
      const FICHA_TECNICA_VACIA = Object.fromEntries(
        ["brand", "capacity", "capsuleSizes", "dimensions", "dosingSystem", "function",
         "manufacturer", "power", "serialNumber", "voltage", "weight", "year"]
          .map((campo) => [campo, "Por registrar"])
      );

      function equipoAMachine(eq) {
        const total = eq.r.length;
        const sinStock = eq.r.filter((r) => r.e === 0).length;
        const codigos = [...new Set(eq.r.map((r) => r.cod).filter(Boolean))];
        return {
          id: eq.id,
          equipoCod: eq.c,
          fromRegistry: true,          // no se guarda en el navegador: sale del registro
          name: eq.n,
          model: eq.n,
          current: "Código " + eq.c,
          area: [eq.u, eq.tipo ? "tipo " + eq.tipo.toLowerCase() : ""].filter(Boolean).join(" · "),
          location: eq.u || "Por confirmar",
          status: "Por confirmar",
          criticality: "Por definir",
          manual: "Pendiente de cargar",
          maintenance: total ? `${total} ${total === 1 ? "repuesto" : "repuestos"} en el plan` : "Sin repuestos en el plan",
          completion: total ? 20 : 10,
          image: "",
          notes: "",
          description: "Ficha básica creada desde el registro de mantenimiento de la empresa. Todavía no tiene manual, despiece ni guía cargados: por ahora trae sus repuestos con el código interno con el que se piden en almacén.",
          technicalData: { ...FICHA_TECNICA_VACIA, function: "Por registrar." },
          summarySpecs: [
            { label: "Código de equipo", value: eq.c },
            { label: "Ubicación", value: eq.u || "Por confirmar" },
            { label: "Centro de costo", value: eq.cc || "—" },
            { label: "Tipo", value: eq.tipo || "—" },
            { label: "Repuestos en el plan", value: String(total) },
            { label: "Sin existencia", value: String(sinStock) }
          ],
          documents: [],
          searchAliases: [eq.c, eq.n, eq.nOriginal, eq.tipo, eq.u, ...codigos].filter(Boolean)
        };
      }

      // Anade al catalogo los equipos que aun no tienen ficha propia, y a las que
      // si la tienen les mete sus codigos internos en el buscador.
      function integrarEquipos() {
        const yaHay = new Set(machines.map((m) => m.id));
        PLAN_EQUIPOS.forEach((eq) => {
          const codigos = [...new Set(eq.r.map((r) => r.cod).filter(Boolean))];
          if (yaHay.has(eq.id)) {
            const m = machines.find((x) => x.id === eq.id);
            if (m) {
              m.equipoCod = eq.c;
              m.searchAliases = [...new Set([...(m.searchAliases ?? []), eq.c, ...codigos])];
            }
            return;
          }
          machines.push(equipoAMachine(eq));
        });
      }
      integrarEquipos();

      function saveMachinesToStorage() {
        try {
          localStorage.setItem(storageMachinesKey, JSON.stringify(machines.filter((m) => !m.fromRegistry)));
        } catch (e) {
          console.error("Error saving machines to localStorage:", e);
        }
      }

      // ========================================================================
      //  APP LOGIC (ORIGINAL PAGE STYLE)
      // ========================================================================
      const views = {
        home: document.querySelector("#homeView"),
        results: document.querySelector("#resultsView"),
        detail: document.querySelector("#detailView"),
        tasks: document.querySelector("#tasksView"),
        plan: document.querySelector("#planView"),
        insp: document.querySelector("#inspView"),
        turnos: document.querySelector("#turnosView")
      };
      const homeSearchForm = document.querySelector("#homeSearchForm");
      const resultsSearchForm = document.querySelector("#resultsSearchForm");
      const homeSearch = document.querySelector("#homeSearch");
      const resultsSearch = document.querySelector("#resultsSearch");
      const resultsList = document.querySelector("#resultsList");
      const previewPanel = document.querySelector("#previewPanel");
      const resultCount = document.querySelector("#resultCount");
      const resultTitle = document.querySelector("#resultTitle");
      const modalBackdrop = document.querySelector("#modalBackdrop");
      const equipmentForm = document.querySelector("#equipmentForm");
      const modalOpeners = document.querySelectorAll("#openModalTop");
      const modalClosers = document.querySelectorAll("#closeModal, #cancelModal");
      const backToHome = document.querySelector("#backToHome");
      const backToResults = document.querySelector("#backToResults");
      const navHome = document.querySelector("[data-nav-home]");
      const navSearch = document.querySelector("[data-nav-search]");
      const navTasks = document.querySelector("[data-nav-tasks]");
      const navPlan = document.querySelector("[data-nav-plan]");
      const navInsp = document.querySelector("[data-nav-insp]");
      const navTurnos = document.querySelector("[data-nav-turnos]");
      const detailTitle = document.querySelector("#detailTitle");
      const detailSubtitle = document.querySelector("#detailSubtitle");
      const guideTabs = document.querySelector("#guideTabs");
      const guidePanels = document.querySelector("#guidePanels");


      let currentQuery = "";
      let selectedId = null;
      const uiStateKey = "equipos-ui-state-v1";

      function saveUiState(extra = {}) {
        const state = {
          currentQuery,
          selectedId,
          ...extra
        };
        localStorage.setItem(uiStateKey, JSON.stringify(state));
      }

      function loadUiState() {
        try {
          return JSON.parse(localStorage.getItem(uiStateKey) || "{}");
        } catch {
          return {};
        }
      }

      function normalize(value) {
        return String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      }

      function getFilteredMachines() {
        const query = normalize(currentQuery);
        if (!query) return machines;
        return machines.filter((machine) => {
          const searchable = [machine.name, machine.model, machine.current, machine.area, machine.location, machine.status, machine.criticality, machine.manual, machine.maintenance, machine.notes, machine.description, ...(machine.searchAliases ?? [])].map(normalize).join(" ");
          return searchable.includes(query);
        });
      }

      function fileToDataUrl(file) {
        return new Promise((resolve) => {
          if (!file || file.size === 0) { resolve(""); return; }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      function rowIcon(name) {
        const icons = {
          location: '<path d="M12 21s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
          status: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
          alert: '<path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
          manual: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20"/>',
          maintenance: '<path d="m14.7 6.3 3 3"/><path d="M16.5 4.5 19.5 7.5 8 19H5v-3L16.5 4.5Z"/>',
          wrench: '<path d="M14.7 6.3 17.7 9.3"/><path d="M4 20l5.5-5.5"/><path d="M15 4l5 5-9.5 9.5H5.5V13.5L15 4Z"/>',
          download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'
        };
        return `<svg class="row-icon" aria-hidden="true" viewBox="0 0 24 24">${icons[name]}</svg>`;
      }

      function renderResultItem(machine) {
        return `
          <button class="result-item ${selectedId === machine.id ? "is-selected" : ""}" type="button" data-select-id="${machine.id}">
            <span class="result-thumb">${machine.image ? `<img src="${machine.image}" alt="${machine.name}" />` : ""}</span>
            <span>
              <h3>${machine.name}</h3>
              <p>${machine.model} · ${machine.current}</p>
            </span>
            <span class="result-tag">Previsualizar</span>
          </button>
        `;
      }

      function detailRow(label, value, icon, options = {}) {
        const valueClass = ["detail-value", options.alert ? "is-alert" : "", options.blue ? "is-blue" : ""].filter(Boolean).join(" ");
        const renderedValue = options.dot ? `<span class="value-dot">${value}</span>` : value;
        return `<div class="detail-row"><div class="detail-label">${rowIcon(icon)}${label}</div><div class="${valueClass}">${renderedValue}</div></div>`;
      }

      function renderPreview(machine) {
        if (!machine) {
          previewPanel.innerHTML = `<div class="empty-state"><div><h3>Selecciona un resultado</h3><p>Haz clic en un equipo para ver su previsualización y abrir la ficha.</p></div></div>`;
          return;
        }
        previewPanel.innerHTML = `
          <article class="equipment-card">
            <div class="equipment-card__top">
              <div>
                <h3>${machine.model}</h3>
                <p class="equipment-card__subtitle">${machine.area}</p>
                <div class="chip-row">
                  <span class="status-chip">${rowIcon("wrench")} ${machine.status}</span>
                </div>
              </div>
              <div class="equipment-image">${machine.image ? `<img src="${machine.image}" alt="${machine.name}" />` : ""}</div>
            </div>
            <div class="completion">
              <div class="completion__label"><span>Información técnica completada</span><span>${machine.completion}%</span></div>
              <div class="progress" aria-label="${machine.completion}%"><span style="width:${machine.completion}%"></span></div>
            </div>
            <div class="info-block">
              <h4>Información general</h4>
              <div class="detail-table">
                ${detailRow("Ubicación", machine.location, "location")}
                ${detailRow("Estado del equipo", machine.status, "status", { dot: true })}
                ${detailRow("Criticidad", machine.criticality, "alert", { alert: true })}
                ${detailRow("Manual", machine.id === "njp3500" ? `<a href="manual%20njp3500.pdf" download="manual njp-350.pdf" class="download-link" style="color: #000000; text-decoration: underline; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">${rowIcon('download')} manual njp-350</a>` : machine.manual, "manual", { alert: true })}
                ${detailRow("Mantenimiento", machine.maintenance, "maintenance")}
              </div>
            </div>
            <button class="card-action" type="button" data-open-detail="${machine.id}">
              Ver ficha del equipo
              <svg class="chevron" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </article>
        `;
      }

      function renderKeyValues(items) {
        return `<div class="kv-list">${items.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>`;
      }

      function renderMiniCard(title, body, badges = [], list = []) {
        return `<article class="mini-card"><h4>${title}</h4><p>${body}</p>${list.length ? `<ul>${list.map(i => `<li>${i}</li>`).join("")}</ul>` : ""}${badges.length ? `<div class="badge-row">${badges.map(b => `<span class="badge ${b.pending ? "badge--pending" : ""}">${b.label}</span>`).join("")}</div>` : ""}</article>`;
      }

      function getGuideSection(machine, title) {
        if (!machine || !Array.isArray(machine.guideSections)) return null;
        return machine.guideSections.find((section) => section.title === title) ?? null;
      }

      function renderGuideBridgeCard(machine, title, cardTitle) {
        const section = getGuideSection(machine, title);
        if (!section) return "";
        return `
          <article class="profile-card profile-card--wide">
            <h3>${cardTitle}</h3>
            ${section.content}
          </article>
        `;
      }

      function renderSystemFigure(figure) {
        if (!figure) return "";
        return `
          <article class="figure-card">
            <img src="${figure.src}" alt="${figure.alt ?? figure.title}" />
            <div class="figure-card__body">
              <span class="figure-card__eyebrow">${figure.eyebrow ?? `Manual · pág. ${figure.page ?? "s/r"}`}</span>
              <h4>${figure.title}</h4>
              <p>${figure.caption ?? ""}</p>
            </div>
          </article>
        `;
      }

      function buildSystemJump(systemId) {
        return `const el=document.getElementById('system-${systemId}'); if(el){ el.open=true; el.scrollIntoView({behavior:'smooth', block:'start'}); }`;
      }

      function renderMachineMap(map) {
        if (!map) return "";
        return `
          <div class="machine-map-clean">
            <div class="machine-map__stage">
              <img src="${map.image.src}" alt="${map.image.alt}" />
              ${(map.hotspots ?? []).map((hotspot) => `
                <button
                  type="button"
                  class="machine-map__hotspot-circle"
                  style="left:${hotspot.x}%;top:${hotspot.y}%;width:${hotspot.w}%;height:${hotspot.h}%;"
                  onclick="${buildSystemJump(hotspot.target)}"
                  aria-label="${hotspot.label}"
                  title="${hotspot.label}"
                ><span>${hotspot.label}</span></button>
              `).join("")}
            </div>
          </div>
        `;
      }

      function renderSystemsPanel(machine) {
        if (!machine?.systemAtlas) {
          return `<div class="item-list">${(machine.systems ?? []).map((s) => renderMiniCard(s.name, s.function, [{label: s.status, pending: true}], s.components ?? [])).join("")}</div>`;
        }

        const atlas = machine.systemAtlas;
        return `
          <div class="systems-atlas">
            <div class="systems-quicknav" style="margin-bottom: 20px;">
              ${(atlas.systems ?? []).map((system) => `<a class="systems-chip" href="#system-${system.id}">${system.name}</a>`).join("")}
            </div>
            
            ${renderMachineMap(atlas.machineMap)}
            ${machine.id === "njp3500" ? `
            <div class="layout-info-card">
              <div class="layout-info-card__header">
                <span class="figure-card__eyebrow">Manual · pág. 35</span>
                <h4>Layout de línea y auxiliares</h4>
              </div>
              <p>Según el plano de distribución del fabricante (pág. 35), el sistema completo de encapsulado integra la máquina principal con los siguientes equipos auxiliares:</p>
              <ul class="layout-list">
                <li><strong>Gabinete de control eléctrico (Electric control box):</strong> panel principal para el suministro de energía e interconexión de control.</li>
                <li><strong>Caja de control de energía (Power control box):</strong> distribución de fuerza neumática y eléctrica principal.</li>
                <li><strong>Pulidora de cápsulas (Polishing machine):</strong> remueve el exceso de polvo de las cápsulas terminadas.</li>
                <li><strong>Pulidora vertical de cápsulas (Vertical polishing machine):</strong> eleva y pule las cápsulas en flujo vertical continuo.</li>
                <li><strong>Tolva de material (Material barrel / LT150-W):</strong> tolva de almacenamiento y alimentación constante de producto hacia la llenadora.</li>
                <li><strong>Llenadora automática de cápsulas (Capsule filling machine):</strong> unidad central NJP-3500 que realiza el llenado y cierre.</li>
                <li><strong>Aspiradora / Colector de polvo (Vacuum cleaner):</strong> aspiración y extracción de polvo excedente y limpieza de estaciones.</li>
                <li><strong>Tanque de agua de recirculación de vacío (Vacuum Circulating Water Tank):</strong> sistema de agua para la bomba de vacío de anillo líquido SK.</li>
              </ul>
            </div>` : ""}

            <section>
              ${(atlas.systems ?? []).map((system, index) => `
                <details class="system-accordion" id="system-${system.id}" ${index < 2 ? "open" : ""}>
                  <summary>
                    <div class="system-accordion__head">
                      <div class="system-accordion__title">
                        <span class="system-accordion__eyebrow">${system.kicker ?? "Subsistema"}</span>
                        <h3>${system.name}</h3>
                        <div class="system-accordion__meta">
                          <span class="badge">${system.station ?? "Sistema"}</span>
                          <span class="badge">Manual pág. ${system.page}</span>
                          <span class="badge badge--pending">${system.status ?? "Base manual"}</span>
                        </div>
                      </div>
                    </div>
                  </summary>
                  <div class="system-accordion__body">
                    ${renderSystemFigure(system.figure)}
                    <p>${system.summary}</p>
                    <div class="system-detail-grid">
                      <article class="info-card">
                        <h4>Función y recorrido</h4>
                        <ul>${(system.flow ?? []).map((item) => `<li>${item}</li>`).join("")}</ul>
                      </article>
                      <article class="info-card">
                        <h4>Componentes clave</h4>
                        <ul>${(system.components ?? []).map((item) => `<li>${item}</li>`).join("")}</ul>
                      </article>
                      <article class="info-card">
                        <h4>Ajustes críticos</h4>
                        <ul>${(system.adjustments ?? []).map((item) => `<li>${item}</li>`).join("")}</ul>
                      </article>
                      <article class="info-card">
                        <h4>Qué revisar si falla</h4>
                        <ul>${(system.diagnostics ?? []).map((item) => `<li>${item}</li>`).join("")}</ul>
                      </article>
                    </div>
                  </div>
                </details>
              `).join("")}
            </section>
          </div>
        `;
      }

      // ── Repuestos: UNA sola tabla por equipo ────────────────────────────────
      // Antes esto eran tres bloques distintos que no cuadraban entre sí: arriba el
      // plan del Excel (con código interno, existencia y ubicación), debajo la
      // tabla del manual (con referencia del fabricante, tipo y criticidad) y al
      // final unas tarjetas sueltas de rodamientos y bujes. Ahora es una sola
      // tabla con las mismas columnas para todos los equipos.
      //
      // La columna de código interno está siempre, aunque el equipo todavía no
      // tenga plan importado: se deja vacía y editable para ir completándola.

      // Equipo del registro, o uno equivalente cuando la máquina no está enlazada
      // al Excel, para que el código y la existencia se puedan editar igual.
      function spEq(machine) {
        return equipoDeMachine(machine) || {
          c: machine.equipoCod || ("m:" + machine.id),
          id: machine.id, n: machine.name, u: machine.location, r: [], sinPlan: true
        };
      }

      // Designaciones de catálogo dentro de un texto: 6202, HK2020, KH2540,
      // ZKLF2068, 51104… Es lo que permite reconocer que la línea del Excel y la
      // del manual hablan de la misma pieza y no duplicarla.
      function spDesign(text) {
        const out = new Set();
        planPlain(text).replace(/[^a-z0-9]+/g, " ").trim().split(" ").forEach((t) => {
          if (!t) return;
          if (/^\d{9}$/.test(t)) return;                     // eso es el código interno, no la referencia
          if (!/\d/.test(t)) return;                         // sin dígitos no es una designación
          if (/^[qe]\d+$/.test(t)) return;                   // cantidades y existencias del plan
          if (t.length >= 4) out.add(t);
        });
        return out;
      }
      function spComparte(a, b) { for (const t of a) if (b.has(t)) return true; return false; }

      // Código interno escrito dentro de la referencia del manual ("741907025 · HK2020").
      function spCodEnTexto(text) { const m = /\b\d{9}\b/.exec(String(text ?? "")); return m ? m[0] : ""; }

      const SP_CRIT_ORDEN = { alta: 0, media: 1, baja: 2 };

      // Une plan del Excel + repuestos del manual + piezas con cambios registrados.
      function sparesUnified(machine) {
        const eq = spEq(machine);
        const manual = (machine.spareParts ?? []).map((p, i) => ({
          p, i,
          cod: p.cod || spCodEnTexto(p.reference),
          des: spDesign((p.name || "") + " " + (p.reference || ""))
        }));
        const usado = new Set();
        const filas = [];

        // 1) Las líneas del plan, enriquecidas con lo que diga el manual de esa pieza.
        (eq.r ?? []).forEach((r) => {
          const cod = repCodigo(eq, r) || r.cod || "";
          const des = spDesign(r.d);
          let m = manual.find((x) => !usado.has(x.i) && x.cod && cod && x.cod === cod);
          if (!m) m = manual.find((x) => !usado.has(x.i) && spComparte(x.des, des));
          if (m) usado.add(m.i);
          filas.push(spFila(eq, r, m && m.p, "plan"));
        });

        // 2) Lo que solo está en el manual (eléctrico, consumibles, piezas de formato…).
        manual.forEach((x) => {
          if (usado.has(x.i)) return;
          const r = { s: x.p.system || "", a: "", cod: x.cod, d: x.p.name, q: x.p.qty || 0, e: 0, o: "", ub: "" };
          filas.push(spFila(eq, r, x.p, "manual"));
        });

        // 3) Piezas que se han cambiado de verdad pero que el Excel no listaba.
        if (!eq.sinPlan) {
          planSueltosDe(eq).forEach(({ cod, lista }) => {
            const ult = lista[lista.length - 1];
            filas.push(spFila(eq, { s: "", a: "", cod, d: ult.d || "", q: ult.q || 0, e: 0, o: "", ub: "" }, null, "registro"));
          });
        }
        return spCanonSistemas(filas);
      }

      // El Excel escribe los sistemas en mayusculas ("DOSIFICACION") y los manuales
      // en normal ("Dosificación"): son el mismo sistema y no deben salir dos veces
      // en los filtros. Se unifican por su forma sin tildes y gana la version
      // escrita a mano, que es la legible.
      function spCanonSistemas(filas) {
        const formas = new Map();
        filas.forEach((f) => {
          if (!f.sistema) return;
          const k = planPlain(f.sistema);
          const previa = formas.get(k);
          const mejor = f.sistema === f.sistema.toUpperCase() && previa ? previa : f.sistema;
          formas.set(k, previa && previa !== previa.toUpperCase() ? previa : mejor);
        });
        formas.forEach((v, k) => {
          if (v === v.toUpperCase()) formas.set(k, v.charAt(0) + v.slice(1).toLowerCase());
        });
        filas.forEach((f) => { if (f.sistema) f.sistema = formas.get(planPlain(f.sistema)) || f.sistema; });
        return filas;
      }

      // Una fila de la tabla, con todo lo que sabemos de esa pieza venga de donde venga.
      function spFila(eq, r, p, fuente) {
        const cod = repCodigo(eq, r) || "";
        const hist = cod ? planCambiosDe(eq.c, cod) : [];
        const med = planMedicion(hist);
        const xls = r.xls || {};
        return {
          eq, r, p, fuente, cod, hist, med,
          clave: datoClave(eq, r),
          sistema: r.s || (p && p.system) || "",
          actividad: r.a || "",
          nombre: r.d || (p && p.name) || "",
          ref: (p && (p.reference || p.status)) || "",
          tipo: (p && p.type) || "",
          crit: (p && p.criticality) || "",
          fn: (p && p.function) || "",
          q: r.q || 0,
          exist: repExistencia(eq, r),
          ub: r.ub || "",
          planFreq: xls.f || "",
          planEj: xls.ej || "",
          planPx: xls.px || "",
          planSt: xls.st || "",
          ultimo: hist.length ? hist[hist.length - 1].fecha : ""
        };
      }

      const spVista = { q: "", sistema: "", orden: "", dir: 1, abierto: new Set() };

      function spFiltradas(machine) {
        const tokens = planTokens(spVista.q);
        let filas = sparesUnified(machine).filter((f) => {
          if (spVista.sistema && f.sistema !== spVista.sistema) return false;
          if (!tokens.length) return true;
          const hay = planPlain([f.cod, f.nombre, f.sistema, f.actividad, f.ref, f.tipo, f.crit, f.fn].join(" "));
          return tokens.every((t) => hay.includes(t));
        });
        const col = spVista.orden;
        if (col) {
          const val = (f) => {
            if (col === "q") return f.q;
            if (col === "exist") return Number(f.exist) || 0;
            if (col === "crit") return SP_CRIT_ORDEN[planPlain(f.crit)] ?? 9;
            if (col === "freq") return f.med ? f.med.prom : 999999;
            return planPlain(f[col] || "");
          };
          filas = [...filas].sort((a, b) => {
            const va = val(a), vb = val(b);
            if (typeof va === "number" && typeof vb === "number") return (va - vb) * spVista.dir;
            return String(va).localeCompare(String(vb)) * spVista.dir;
          });
        }
        return filas;
      }

      function spTh(col, etiqueta, clase) {
        const activa = spVista.orden === col;
        const flecha = activa ? (spVista.dir === 1 ? " ↑" : " ↓") : "";
        return `<th class="${clase || ""} pl-th-sort ${activa ? "is-sorted" : ""}" onclick="spOrdenar('${col}')" title="Ordenar por ${etiqueta}">${etiqueta}${flecha}</th>`;
      }
      function spOrdenar(col) {
        if (spVista.orden === col) spVista.dir = -spVista.dir; else { spVista.orden = col; spVista.dir = 1; }
        renderFichaSiVisible();
      }
      function spBuscar(valor) {
        spVista.q = valor;
        renderFichaSiVisible();
        const caja = document.getElementById("sparesSearch");
        if (caja) { caja.focus(); caja.setSelectionRange(caja.value.length, caja.value.length); }
      }
      function spSistema(sistema) { spVista.sistema = sistema === spVista.sistema ? "" : sistema; renderFichaSiVisible(); }
      function spToggle(clave) {
        if (spVista.abierto.has(clave)) spVista.abierto.delete(clave); else spVista.abierto.add(clave);
        renderFichaSiVisible();
      }

      // Registrar un cambio de cualquier fila, tenga o no línea en el Excel.
      function spRegistrar(eqC, cod, desc, q) {
        if (!cod) { alert("Escribe primero el código interno de la pieza para poder registrar el cambio."); return; }
        planRegCtx = { eq: eqC, cod, d: desc || "", q: Number(q) || 1 };
        const sheet = document.getElementById("plSheet");
        const back = document.getElementById("plSheetBackdrop");
        const what = document.getElementById("plSheetWhat");
        const form = document.getElementById("plForm");
        if (!sheet || !back || !form) return;
        if (what) what.innerHTML = `<strong>${planEsc(cod)}</strong> &middot; ${planEsc(desc || "")}`;
        form.reset();
        form.fecha.value = new Date().toISOString().slice(0, 10);
        form.q.value = Number(q) || 1;
        back.hidden = false;
        sheet.hidden = false;
        setTimeout(() => form.fecha.focus(), 60);
      }

      const SP_FUENTE = {
        plan: { txt: "Plan", tip: "Línea del plan de mantenimiento importado del Excel de la empresa." },
        manual: { txt: "Manual", tip: "Repuesto leído del manual o del catálogo del fabricante. Todavía sin código interno en el plan." },
        registro: { txt: "Registrado", tip: "Pieza que se ha cambiado de verdad pero que el Excel no tenía en el plan de este equipo." }
      };

      function renderSparesPanel(machine) {
        const eq = spEq(machine);
        const todas = sparesUnified(machine);
        const filas = spFiltradas(machine);
        const tokens = planTokens(spVista.q);
        const conCod = todas.filter((f) => f.cod).length;
        const sinCod = todas.length - conCod;
        // Existencia efectiva: la que se haya escrito aqui, y si no la que traia el Excel.
        const sinStock = todas.filter((f) => f.fuente === "plan" && Number(f.exist === "" ? f.r.e : f.exist) === 0).length;
        const criticos = todas.filter((f) => planPlain(f.crit) === "alta").length;
        const conHist = todas.filter((f) => f.hist.length).length;
        const sistemas = {};
        todas.forEach((f) => { if (f.sistema) sistemas[f.sistema] = (sistemas[f.sistema] || 0) + 1; });

        return `<div class="pl-panel sp-panel">
          <div class="panel-header-clean">
            <h3>Repuestos del equipo &middot; c&oacute;digo ${planEsc(eq.c)}</h3>
            ${eq.sinPlan ? `<p class="pl-aviso">Este equipo no tiene plan importado del Excel${machine.equipoCod && !codigoEnRegistro(machine.equipoCod) ? `: su c&oacute;digo <strong>${planEsc(machine.equipoCod)}</strong> no aparece en los listados oficiales DMM-179` : ""}. Los repuestos de abajo salen del manual; el c&oacute;digo interno se puede ir escribiendo aqu&iacute;.</p>` : ""}
            <p>Una sola tabla con todos los repuestos de este equipo: los del <strong>plan del Excel</strong> (c&oacute;digo interno, cantidad, existencia y ubicaci&oacute;n) y los del <strong>manual del fabricante</strong> (referencia, tipo, criticidad y funci&oacute;n), ya unidos.
               El c&oacute;digo interno y la existencia se escriben aqu&iacute; mismo y quedan para todo el taller. Pulsa el nombre de una pieza para ver su detalle.</p>
          </div>
          <div class="pl-kpis">
            <div class="pl-kpi"><span class="pl-kpi__n">${todas.length}</span><span class="pl-kpi__l">Repuestos</span></div>
            <div class="pl-kpi pl-kpi--ok"><span class="pl-kpi__n">${conCod}</span><span class="pl-kpi__l">Con c&oacute;digo interno</span></div>
            <div class="pl-kpi pl-kpi--warn"><span class="pl-kpi__n">${sinCod}</span><span class="pl-kpi__l">Falta el c&oacute;digo</span></div>
            <div class="pl-kpi pl-kpi--stock"><span class="pl-kpi__n">${sinStock}</span><span class="pl-kpi__l">Sin existencia</span></div>
            <div class="pl-kpi"><span class="pl-kpi__n">${criticos}</span><span class="pl-kpi__l">Criticidad alta</span></div>
            <div class="pl-kpi pl-kpi--ok"><span class="pl-kpi__n">${conHist}</span><span class="pl-kpi__l">Con historial</span></div>
          </div>
          <div class="pl-filters">
            <input type="search" id="sparesSearch" placeholder="Buscar: c&oacute;digo interno, repuesto, referencia, sistema&hellip;" value="${planEsc(spVista.q)}" oninput="spBuscar(this.value)" aria-label="Buscar repuestos de este equipo">
            <span class="counter">${filas.length} de ${todas.length}</span>
          </div>
          ${Object.keys(sistemas).length > 1 ? `<div class="spares-filter-tags">
            <button class="filter-tag-btn ${spVista.sistema ? "" : "active"}" type="button" onclick="spSistema('')">Todos</button>
            ${Object.keys(sistemas).sort((a, b) => sistemas[b] - sistemas[a] || a.localeCompare(b)).map((s) =>
              `<button class="filter-tag-btn ${spVista.sistema === s ? "active" : ""}" type="button" onclick="spSistema('${planEsc(s).replace(/'/g, "&#39;")}')">${planEsc(s)} <span class="ftb-n">${sistemas[s]}</span></button>`).join("")}
          </div>` : ""}
          <div class="pl-tablewrap">
            <table class="pl-table sp-table">
              <thead><tr>
                ${spTh("sistema", "Sistema")}${spTh("cod", "Cód. interno")}${spTh("nombre", "Repuesto")}${spTh("ref", "Referencia / P/N")}
                ${spTh("tipo", "Tipo")}${spTh("crit", "Criticidad")}${spTh("q", "Cant.", "pl-num")}${spTh("exist", "Exist.", "pl-num")}
                ${spTh("freq", "Frecuencia")}${spTh("ultimo", "Último cambio")}<th></th>
              </tr></thead>
              <tbody>${filas.length ? filas.map((f) => spFilaHtml(f, tokens)).join("")
                : '<tr><td colspan="11" class="pl-soft" style="padding:18px;text-align:center">Nada coincide con esa b&uacute;squeda en este equipo.</td></tr>'}</tbody>
            </table>
          </div>
          <p class="pl-note sp-leyenda">
            <span class="sp-src sp-src--plan">Plan</span> viene del Excel de mantenimiento &middot;
            <span class="sp-src sp-src--manual">Manual</span> del manual del fabricante &middot;
            <span class="sp-src sp-src--registro">Registrado</span> se cambi&oacute; en planta y el Excel no lo ten&iacute;a.
            La <strong>frecuencia</strong> es la medida con los cambios registrados; debajo, la que dice el plan.
          </p>
        </div>`;
      }

      // ── "¿Dónde va?" — de un repuesto a su sitio en la máquina ──────────────
      // Tener el código no sirve de nada si nadie sabe dónde monta la pieza. Cada
      // fila de repuestos lleva un botón que salta al mejor sitio que tengamos
      // para esa pieza, en este orden:
      //   1. la lámina de despiece donde sale su número (lo más exacto),
      //   2. la tabla de sensores del esquema, si es un sensor con sigla,
      //   3. el sistema de la máquina al que pertenece.

      // Números de pieza que aparecen en el nombre o la referencia.
      function spRefsDe(f) {
        const txt = [f.ref, f.nombre].join(" ");
        // Los P/N de fabricante llevan guiones (8-104-322-400), así que entran también.
        return (txt.match(/\b[A-Z0-9][A-Z0-9._-]{4,}[A-Z0-9]\b/g) || []).filter((t) => /\d/.test(t));
      }

      function spDondeVa(machine, f) {
        // 1. La lámina de despiece donde sale ese número de pieza.
        const M = (typeof mecDeMaquina === "function") ? mecDeMaquina(machine.id) : null;
        if (M) {
          const refs = spRefsDe(f);
          for (const ref of refs) {
            for (const [cod, g] of Object.entries(M.grupos)) {
              if (g.piezas.includes(ref)) return { tipo: "despiece", cod, ref, txt: "Despiece · " + g.n };
            }
          }
        }
        // 1b. La GKF tiene su propio despiece: si la referencia está en su catálogo,
        //     se puede señalar el grupo y la lámina donde sale.
        const G = (typeof MACHINE_PARTS !== "undefined") ? MACHINE_PARTS[machine.id] : null;
        if (G) {
          const norm = (v) => planPlain(v).replace(/[^a-z0-9]/g, "");
          const refs = spRefsDe(f).map(norm);
          const p = G.parts.find((x) => refs.includes(norm(x.r)));
          if (p) {
            const g = G.groups.find((x) => x.p === p.g);
            return { tipo: "px", ref: p.r, txt: "Despiece · " + (g ? g.n : "grupo " + p.g) };
          }
        }

        // 1c. La Integra tiene su despiece indexado por código de pieza.
        const T = (typeof MACHINE_TABLES !== "undefined") ? MACHINE_TABLES[machine.id] : null;
        if (T) {
          for (const ref of spRefsDe(f)) {
            const hit = T.idx[ref] || T.idx[ref.toUpperCase()];
            if (hit && hit.length) {
              const t = T.tablas[hit[0]];
              return { tipo: "tb", i: hit[0], ref, txt: "Despiece · tabla " + (t ? t.id : "") };
            }
          }
        }

        // 2. Un sensor: la función trae la sigla con la que sale en el esquema.
        const sig = /\b(B\d+[A-Z]?\.\d+)/.exec(f.fn || "");
        if (sig && machine.schematic && typeof sensoresMS235 === "function" && sensoresMS235().length) {
          return { tipo: "sensores", q: sig[1], txt: "Plano eléctrico · sensor " + sig[1] };
        }
        // 3. El sistema del que forma parte.
        const sis = spSistemaDeAtlas(machine, f.sistema);
        if (sis) return { tipo: "sistema", id: sis.id, txt: "Sistemas · " + sis.name };
        return null;
      }

      // El sistema del atlas que corresponde a un nombre de sistema de la tabla.
      // El Excel y los manuales no lo escriben igual ("DOSIFICACION" contra
      // "Dosificación volumétrica", "Estación dosificadora"), así que se comparan
      // las raíces de las palabras con peso: "dosifi" vale, "sistema" no.
      const SP_RUIDO = new Set(["sistema", "sistem", "estaci", "grupo", "gruppo", "maquin", "genera", "comple", "princi", "contro"]);
      function spRaices(texto) {
        return new Set(planPlain(texto).replace(/[^a-z0-9]+/g, " ").split(" ")
          .filter((w) => w.length >= 6).map((w) => w.slice(0, 6)).filter((w) => !SP_RUIDO.has(w)));
      }
      function spSistemaDeAtlas(machine, sistema) {
        const lista = machine.systemAtlas?.systems ?? machine.systems ?? [];
        if (!sistema || !lista.length) return null;
        const a = planPlain(sistema);
        if (a.length < 5) return null;
        const exacto = lista.find((s) => {
          const b = planPlain(s.name || "");
          return b.includes(a) || a.includes(b);
        });
        if (exacto) return exacto;
        const ra = spRaices(sistema);
        if (!ra.size) return null;
        return lista.find((s) => { for (const r of spRaices(s.name || "")) if (ra.has(r)) return true; return false; }) || null;
      }

      function spActivarPestana(id) {
        const b = guideTabs.querySelector(`[data-profile-tab="${id}"]`);
        if (b) b.click();
        return !!b;
      }

      function spDestacar(el) {
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("is-flash");
        setTimeout(() => el.classList.remove("is-flash"), 1800);
      }

      function spIrAUbicacion(clave) {
        const machine = machines.find((m) => m.id === selectedId);
        if (!machine) return;
        const f = sparesUnified(machine).find((x) => x.clave === clave);
        const u = f && spDondeVa(machine, f);
        if (!u) return;

        if (u.tipo === "despiece") {
          const g = mecDeMaquina(machine.id).grupos[u.cod];
          mecState.mid = machine.id;
          mecState.grupo = u.cod;
          mecState.q = u.ref;
          const i = g.hojas.findIndex((h) => (h.p || []).includes(u.ref));
          mecState.hoja = i < 0 ? 0 : i;
          spActivarPestana("partsmap");
          mecRefresh();
          setTimeout(() => spDestacar(document.querySelector('[data-profile-panel="partsmap"] .mec-lamina')), 60);
          return;
        }
        if (u.tipo === "px") {
          spActivarPestana("partsmap");
          setTimeout(() => {
            const caja = document.getElementById("pxSearch");
            if (caja) { caja.value = u.ref; pxSearch(machine.id); }
            spDestacar(document.getElementById("pxHits"));
          }, 60);
          return;
        }
        if (u.tipo === "tb") {
          spActivarPestana("partsmap");
          setTimeout(() => {
            const caja = document.getElementById("tbSearch");
            if (caja) { caja.value = u.ref; tbSearch(machine.id); }
            tbSelect(machine.id, u.i);
            spDestacar(document.getElementById("tbPanel"));
          }, 60);
          return;
        }
        if (u.tipo === "sensores") {
          senVista.q = u.q;
          senVista.zona = "";
          spActivarPestana("schematic");
          senRefresh();
          setTimeout(() => spDestacar(document.getElementById("senPanel")), 60);
          return;
        }
        spActivarPestana("systems");
        setTimeout(() => {
          const el = document.getElementById("system-" + u.id);
          if (el) { el.open = true; spDestacar(el); }
        }, 60);
      }

      // El nombre del sistema en la tabla también lleva a su sistema.
      function spIrASistema(sistema) {
        const machine = machines.find((m) => m.id === selectedId);
        const sis = machine && spSistemaDeAtlas(machine, sistema);
        if (!sis) return;
        spActivarPestana("systems");
        setTimeout(() => {
          const el = document.getElementById("system-" + sis.id);
          if (el) { el.open = true; spDestacar(el); }
        }, 60);
      }

      function spFilaHtml(f, tokens) {
        const abierto = spVista.abierto.has(f.clave);
        const pend = f.eq.sinPlan ? null : inspPendientesDe(f.eq.c).get(f.cod);
        const freq = f.med
          ? `<strong>cada ${planEsc(planFmtDias(f.med.prom))}</strong>${f.planFreq ? `<span class="pl-obs">plan: ${planEsc(f.planFreq)}</span>` : ""}`
          : f.planFreq
            ? `<span class="pl-soft">plan: ${planEsc(f.planFreq)}</span>${f.hist.length === 1 ? '<span class="pl-obs">1 registro &mdash; falta otro para medirla</span>' : ""}`
            : f.hist.length === 1 ? '<span class="pl-soft">1 registro &mdash; falta otro</span>' : '<span class="pl-soft">sin registrar</span>';
        const src = SP_FUENTE[f.fuente] || SP_FUENTE.plan;
        const fila = `<tr class="sp-row ${f.hist.length ? "" : "is-nuevo"} ${pend ? "is-pendiente" : ""} ${abierto ? "is-open" : ""}">
          <td class="sp-sys">${(() => {
            const m = machines.find((x) => x.id === selectedId);
            const txt = planMark(f.sistema, tokens) || "&mdash;";
            return (m && spSistemaDeAtlas(m, f.sistema))
              ? `<button class="sp-sys__go" type="button" onclick="spIrASistema('${planEsc(f.sistema).replace(/'/g, "&#39;")}')" title="Ver este sistema en la m&aacute;quina">${txt}</button>`
              : txt;
          })()}<span class="sp-src sp-src--${f.fuente}" title="${planEsc(src.tip)}">${src.txt}</span></td>
          <td class="pl-code"><input class="pl-edit pl-edit--cod" value="${planEsc(f.cod)}" placeholder="&mdash;" title="C&oacute;digo interno con el que se pide en almac&eacute;n. Se comparte con todo el taller." onchange="editarDato(this, '${planEsc(f.clave)}', 'cod')"></td>
          <td class="pl-desc"><button class="sp-name" type="button" onclick="spToggle('${planEsc(f.clave)}')" title="Ver el detalle de esta pieza">${planMark(f.nombre, tokens) || "&mdash;"}</button>${pend ? `<span class="in-marca in-urg--${planEsc(pend.urgencia || "media")}">${planEsc(INSP_URGENCIA[pend.urgencia] || "Programar")} &middot; inspecci&oacute;n del ${planEsc(pend.fecha)}</span>` : ""}</td>
          <td class="sp-ref">${f.ref ? planMark(f.ref, tokens) : "&mdash;"}</td>
          <td>${f.tipo ? `<span class="type-badge">${planEsc(f.tipo)}</span>` : "&mdash;"}</td>
          <td>${f.crit ? `<span class="criticality-badge criticality-${planPlain(f.crit).replace(/ /g, "-")}">${planEsc(f.crit)}</span>` : "&mdash;"}</td>
          <td class="pl-num">${f.q || "&mdash;"}</td>
          <td class="pl-num"><input class="pl-edit pl-edit--num" value="${planEsc(f.exist)}" placeholder="&mdash;" title="${f.r.e ? "El Excel dec&iacute;a " + f.r.e + ". " : ""}Escribe la existencia real; se comparte con todo el taller." onchange="editarDato(this, '${planEsc(f.clave)}', 'exist')"></td>
          <td class="pl-freq">${freq}</td>
          <td class="pl-loc">${f.ultimo ? planEsc(f.ultimo) : "&mdash;"}${f.hist.length ? `<button class="pl-hist-btn" type="button" onclick="spToggle('${planEsc(f.clave)}')">${f.hist.length} ${f.hist.length === 1 ? "registro" : "registros"}</button>` : ""}</td>
          <td class="pl-num"><button class="pl-reg" type="button" onclick="spRegistrar('${planEsc(f.eq.c)}','${planEsc(f.cod)}','${planEsc(f.nombre).replace(/'/g, "&#39;")}',${f.q || 1})" title="Registrar un cambio de esta pieza">Registrar</button></td>
        </tr>`;
        if (!abierto) return fila;
        const detalle = [
          f.actividad ? ["Actividad", planEsc(f.actividad)] : null,
          f.ub ? ["Ubicaci&oacute;n en almac&eacute;n", planEsc(f.ub)] : null,
          f.planFreq ? ["Frecuencia del plan", planEsc(f.planFreq)] : null,
          f.planEj ? ["&Uacute;ltima ejecuci&oacute;n (plan)", planEsc(f.planEj)] : null,
          f.planPx ? ["Pr&oacute;xima seg&uacute;n el plan", planEsc(f.planPx)] : null,
          f.planSt ? ["Estado en el plan", `<span class="sp-estado sp-estado--${planPlain(f.planSt).replace(/ /g, "-")}">${planEsc(f.planSt)}</span>`] : null,
          f.r.pu ? ["&Uacute;ltimo precio unitario", "$" + Number(f.r.pu).toLocaleString("es-CO")] : null,
          f.med ? ["Pr&oacute;ximo cambio estimado", planEsc(f.med.proximo) + " (" + f.med.mediciones + " intervalo" + (f.med.mediciones === 1 ? "" : "s") + " medido" + (f.med.mediciones === 1 ? "" : "s") + ")"] : null
        ].filter(Boolean);
        return fila + `<tr class="pl-histrow sp-detalle"><td colspan="11">
          <div class="sp-det">
            ${(() => {
              const m = machines.find((x) => x.id === selectedId);
              const u = m && spDondeVa(m, f);
              return u ? `<div class="sp-det__ir">
                <button class="button button--dark" type="button" onclick="spIrAUbicacion('${planEsc(f.clave)}')">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>
                  Ver d&oacute;nde va
                </button>
                <span class="sp-det__irtxt">${planEsc(u.txt)}</span>
              </div>` : '<p class="pl-soft">Todav&iacute;a no sabemos en qu&eacute; parte de la m&aacute;quina monta esta pieza.</p>';
            })()}
            ${f.fn ? `<p class="sp-det__fn"><strong>Qu&eacute; hace:</strong> ${planEsc(f.fn)}</p>` : ""}
            ${detalle.length ? `<div class="sp-det__kv">${detalle.map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join("")}</div>` : ""}
            ${f.hist.length ? `<div class="pl-hist">
              <span class="pl-hist__t">Cambios registrados de ${planEsc(f.cod)}</span>
              ${f.hist.map((ev, i) => {
                const prev = i > 0 ? planDiasEntre(f.hist[i - 1].fecha, ev.fecha) : null;
                return `<div class="pl-ev">
                  <span class="pl-ev__f">${planEsc(ev.fecha)}</span>
                  <span class="pl-ev__d">${ev.q ? planEsc(ev.q) + " ud. " : ""}${planEsc(ev.quien) || ""}${ev.nota ? (ev.quien ? " &middot; " : "") + planEsc(ev.nota) : ""}</span>
                  ${prev !== null && isFinite(prev) ? `<span class="pl-ev__i">+${planEsc(planFmtDias(prev))}</span>` : '<span class="pl-ev__i">1.&ordm;</span>'}
                  <button class="pl-ev__x" type="button" onclick="planBorrarCambio('${planEsc(ev.id)}')" title="Borrar este registro">&times;</button>
                </div>`;
              }).join("")}
            </div>` : '<p class="pl-soft">Todav&iacute;a no hay ning&uacute;n cambio registrado de esta pieza.</p>'}
          </div></td></tr>`;
      }

      function renderMaintenancePanel(machine) {
        return `
          <div class="maintenance-panel-container">
            <div class="panel-header-clean">
              <h3>Plan de Mantenimiento Preventivo y Lubricación</h3>
              <p>Cronograma de tareas según el plan de mantenimiento del manual (pág. 50–53) y la tabla de lubricación (pág. 70). Las frecuencias por nivel son <strong>propuesta de planta</strong>, salvo las marcadas como del manual (batería del PLC cada 12 meses e inspección de seguridad anual).</p>
            </div>

            <div class="maintenance-filter-tabs" style="margin-bottom: 16px;">
              <button class="maint-tab-btn active" onclick="filterMaint('All', this)">Todas las Frecuencias</button>
              ${(() => {
                const ORDER = ["Diario","Semanal","Mensual","Trimestral","Semestral","Anual"];
                const present = [...new Set((machine.maintenanceTasks ?? []).map(t => t.frequency).filter(Boolean))];
                present.sort((a, b) => {
                  const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
                  if (ia !== -1 && ib !== -1) return ia - ib;
                  if (ia !== -1) return -1;
                  if (ib !== -1) return 1;
                  const ha = /(\d[\d.]*)\s*h/.exec(a), hb = /(\d[\d.]*)\s*h/.exec(b);
                  if (ha && hb) return parseFloat(ha[1].replace(".", "")) - parseFloat(hb[1].replace(".", ""));
                  return a.localeCompare(b);
                });
                return present.map(fq => `<button class="maint-tab-btn" onclick="filterMaint('${fq.replace(/'/g, "")}', this)">${fq}</button>`).join("");
              })()}
            </div>

            <div class="table-container">
              <table class="premium-table" id="maintenance-table">
                <thead>
                  <tr>
                    <th>Frecuencia</th>
                    <th>Tarea de Mantenimiento</th>
                    <th>Sistema</th>
                    <th>Tipo</th>
                    <th>Criterio de Aceptación / Tolerancia</th>
                  </tr>
                </thead>
                <tbody>
                  ${(machine.maintenanceTasks ?? []).map((t) => `
                    <tr class="maint-row" data-freq="${t.frequency}">
                      <td><span class="freq-badge freq-${t.frequency.toLowerCase().replace(' / ', '-').replace(' ', '-')}" style="padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">${t.frequency}</span></td>
                      <td><strong>${t.name}</strong></td>
                      <td><span class="system-badge">${t.system}</span></td>
                      <td><span class="type-badge">${t.type}</span></td>
                      <td><span style="color: var(--muted); font-size: 0.9rem;">${t.acceptance}</span></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="lubrication-section">
              <div class="rodamientos-header">
                <h4>Plan de Lubricación del Fabricante (pág. 70 · Tabla 4.1)</h4>
                <p>Detalle de productos recomendados y puntos de aplicación para conservar la garantía y vida útil del equipo:</p>
              </div>
              <div class="lubrication-table-container">
                <table class="lubrication-table">
                  <thead>
                    <tr>
                      <th>Punto de Aplicación</th>
                      <th>Producto Recomendado</th>
                      <th>Tipo / Código Técnico</th>
                      <th>Frecuencia / Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Cadena de transmisión</strong></td>
                      <td>Aceite N4B GB443-84</td>
                      <td>Lubricación directa</td>
                      <td>Propuesta de planta · revisar regularmente</td>
                    </tr>
                    <tr>
                      <td><strong>Rodamientos de rodillos / Guías lineales</strong></td>
                      <td>Grasa N4B GB443-84</td>
                      <td>Rodamiento lineal</td>
                      <td>Propuesta de planta · inspección regular</td>
                    </tr>
                    <tr>
                      <td><strong>Levas principales</strong></td>
                      <td>Grasa ZL2SY1412-75</td>
                      <td>Grasa para levas</td>
                      <td>Propuesta de planta · inspección regular</td>
                    </tr>
                    <tr>
                      <td><strong>Caja de engranajes / Reductor principal</strong></td>
                      <td>Aceite ZLDSY1412-75</td>
                      <td>Lubricación en baño</td>
                      <td>Revisar nivel regularmente · cambio según fabricante</td>
                    </tr>
                    <tr>
                      <td><strong>Levas de estaciones y carros móviles</strong></td>
                      <td>STABYL 300 AL2</td>
                      <td>Grasa premium</td>
                      <td>Aplicar durante el mantenimiento rutinario</td>
                    </tr>
                    <tr>
                      <td><strong>Guías y empujadores direccionales</strong></td>
                      <td>Fuchs GERALYN</td>
                      <td>Spray / Inyección</td>
                      <td>1–2 disparos en mantenimiento preventivo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="lub-rules">
                <h5>Reglas de Seguridad y Buenas Prácticas</h5>
                <ul>
                  <li><strong>Energía Cero:</strong> No intervenir mecánicamente ni aplicar lubricación con el equipo encendido o conectado.</li>
                  <li><strong>Presión de aire:</strong> Liberar toda la presión de aire residual acumulada en mangueras antes de intervenir los sistemas neumáticos.</li>
                  <li><strong>Aspiración:</strong> La limpieza interior de las estaciones y torreta debe realizarse <strong>únicamente con aspiradora técnica</strong>, no con aire soplado, para evitar que el polvo de producto se introduzca en los rodamientos sellados de la máquina.</li>
                </ul>
              </div>
            </div>
          </div>
        `;
      }

      function filterMaint(frequency, btn) {
        const buttons = document.querySelectorAll('.maint-tab-btn');
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Los chips se generan desde las frecuencias reales de la máquina: comparación directa
        const rows = document.querySelectorAll('#maintenance-table tbody tr');
        rows.forEach(row => {
          const freq = row.getAttribute('data-freq');
          row.style.display = (frequency === 'All' || freq === frequency) ? '' : 'none';
        });
      }

      function renderFailuresPanel(machine) {
        const failures = machine.failureModes ?? [];
        return `
          <div class="failures-panel-container">
            <div class="panel-header-clean" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div>
                <h3>Registro de Fallas y Diagnóstico</h3>
                <p>Base de conocimiento del equipo: Fallas comunes identificadas en el manual y reportadas por operadores.</p>
              </div>
              <button class="button button--dark" onclick="toggleAddFailureForm()" id="btn-toggle-failure-form" style="background:#000000 !important; color:#ffffff !important; border:none; border-radius:999px; min-height:38px; font-weight:700;">+ Reportar Falla</button>
            </div>

            <!-- Formulario Añadir Falla (colapsable) -->
            <div id="add-failure-form-container" class="add-failure-form-container" style="display: none; margin-bottom: 24px; padding: 20px; border: 1px solid var(--line-strong); border-radius: 16px; background: #fff; box-shadow: var(--shadow-card);">
              <h4 style="margin-top: 0; margin-bottom: 16px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                ${rowIcon('alert')} Reportar nueva falla / caso resuelto
              </h4>
              <form id="add-failure-form" onsubmit="submitFailure(event, '${machine.id}')" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div>
                  <label class="form-field" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; font-weight: 600;">
                    Falla / Nombre común *
                    <input type="text" name="name" required placeholder="Ej. Pérdida de succión en estación 2" style="height: 40px; padding: 0 12px; border: 1px solid var(--line-strong); border-radius: 8px; outline: none; font-size: 0.9rem;" />
                  </label>
                </div>
                <div>
                  <label class="form-field" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; font-weight: 600;">
                    Sistema afectado *
                    <select name="probableSystem" required style="height: 40px; padding: 0 12px; border: 1px solid var(--line-strong); border-radius: 8px; outline: none; font-size: 0.9rem; background:#fff;">
                      <option value="">Seleccione el sistema...</option>
                      <option value="Vacío / Separación">Vacío / Separación</option>
                      <option value="Dosificación / Tamping">Dosificación / Tamping</option>
                      <option value="Alimentación / Orientación">Alimentación / Orientación</option>
                      <option value="Cierre de Cápsulas">Cierre de Cápsulas</option>
                      <option value="Expulsión / Descarga">Expulsión / Descarga</option>
                      <option value="Limpieza de Moldes">Limpieza de Moldes</option>
                      <option value="Colector de Polvo">Colector de Polvo</option>
                      <option value="Transmisión / Motor">Transmisión / Motor</option>
                      <option value="Neumático / Aire">Neumático / Aire</option>
                      <option value="Eléctrico / HMI">Eléctrico / HMI</option>
                      <option value="Otro">Otro / Auxiliar</option>
                    </select>
                  </label>
                </div>
                <div style="grid-column: span 2;">
                  <label class="form-field" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; font-weight: 600;">
                    Síntomas observados *
                    <input type="text" name="symptoms" required placeholder="Ej. Cápsulas no se abren, alarma de baja presión de vacío" style="height: 40px; padding: 0 12px; border: 1px solid var(--line-strong); border-radius: 8px; outline: none; font-size: 0.9rem;" />
                  </label>
                </div>
                <div style="grid-column: span 2;">
                  <label class="form-field" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; font-weight: 600;">
                    Qué verificar *
                    <textarea name="checks" required rows="3" placeholder="Detalle qué se debe inspeccionar. Ej. Nivel de vacío en manómetro, limpieza del filtro en línea, manguera en busca de grietas." style="padding: 10px 12px; border: 1px solid var(--line-strong); border-radius: 8px; outline: none; font-size: 0.9rem; font-family: inherit; resize: vertical;"></textarea>
                  </label>
                </div>
                <div style="grid-column: span 2;">
                  <label class="form-field" style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; font-weight: 600;">
                    Cómo corregirlo / Resolución *
                    <textarea name="correction" required rows="3" placeholder="Detalle cómo se resolvió la falla o la corrección recomendada. Ej. Desmontar filtro y lavar con agua a presión, ajustar holgura del asiento a 2.0 mm." style="padding: 10px 12px; border: 1px solid var(--line-strong); border-radius: 8px; outline: none; font-size: 0.9rem; font-family: inherit; resize: vertical;"></textarea>
                  </label>
                </div>
                <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;">
                  <button class="button button--light" type="button" onclick="toggleAddFailureForm()" style="min-height:36px; padding: 0 16px;">Cancelar</button>
                  <button class="button button--dark" type="submit" style="min-height:36px; padding: 0 16px; background: #000000 !important; color:#ffffff !important;">Guardar en historial</button>
                </div>
              </form>
            </div>

            <!-- Lista de fallas (tarjetas expandibles con diagnóstico paso a paso) -->
            <p style="color:var(--muted);font-size:0.9rem;margin:0 0 12px">Toca una falla para ver el <strong>diagnóstico paso a paso</strong>: dónde mirar, cómo hacerlo, la medida esperada, la herramienta y qué hacer si está fuera de rango.</p>
            <div class="failures-list" id="failures-table-body">
              ${failures.map((f) => {
                const symptomsList = [].concat(f.symptoms);
                const originLabel = f.status || "Base manual consolidada";
                const isUserReported = originLabel.includes("Reportada") || originLabel.includes("Usuario");
                const nSteps = (f.steps?.length || 0);
                return `
                  <details class="failure-card">
                    <summary class="failure-card__summary">
                      <div class="failure-card__top">
                        <span class="failure-card__name">${f.name}</span>
                        <span class="system-badge">${f.probableSystem}</span>
                        <span class="origin-badge ${isUserReported ? "origin-badge--user" : "origin-badge--manual"}">${isUserReported ? "Reportada" : "Manual"}</span>
                      </div>
                      <div class="failure-card__sym">Síntomas: ${symptomsList.join(" · ")}${nSteps ? ` · <span class="failure-card__steps">${nSteps} pasos de diagnóstico</span>` : ""}</div>
                    </summary>
                    <div class="failure-card__body">
                      ${ruleResponseHtml(f, machine)}
                    </div>
                  </details>`;
              }).join("")}
            </div>
          </div>
        `;
      }

      function toggleAddFailureForm() {
        const container = document.getElementById("add-failure-form-container");
        const btn = document.getElementById("btn-toggle-failure-form");
        if (container.style.display === "none") {
          container.style.display = "block";
          btn.textContent = "Cancelar";
          container.querySelector('input[name="name"]').focus();
        } else {
          container.style.display = "none";
          btn.textContent = "+ Reportar Falla";
        }
      }

      function submitFailure(event, machineId) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const name = String(formData.get("name")).trim();
        const probableSystem = String(formData.get("probableSystem")).trim();
        const symptomsText = String(formData.get("symptoms")).trim();
        const checksText = String(formData.get("checks")).trim();
        const correctionText = String(formData.get("correction")).trim();
        
        if (!name || !probableSystem || !symptomsText || !checksText || !correctionText) {
          alert("Por favor rellene todos los campos obligatorios.");
          return;
        }

        const machine = machines.find(m => m.id === machineId);
        if (machine) {
          if (!machine.failureModes) {
            machine.failureModes = [];
          }
          machine.failureModes.unshift({
            name: name,
            probableSystem: probableSystem,
            status: "Reportada por usuario",
            symptoms: symptomsText.split(",").map(s => s.trim()).filter(Boolean),
            checks: checksText.split("\n").map(c => c.trim()).filter(Boolean),
            correction: correctionText
          });
          
          // Persist the updated machines list
          saveMachinesToStorage();
          
          // Re-render the failures panel
          const panel = document.querySelector('[data-profile-panel="failures"]');
          if (panel) {
            panel.innerHTML = renderFailuresPanel(machine);
          }
        }
      }

      // ── Step → Atlas image lookup (machineId → failureName → stepTitle → systemId) ──
      const STEP_IMAGE_REFS = {
        njp3500: {
          "Cápsulas no se separan": {
            "Nivel de agua en bomba SK":        "vacio-auxiliares",
            "Filtros de succión":               "vacio-auxiliares",
            "Altura del asiento de succión":    "vacio-separacion"
          },
          "Variación de peso": {
            "Holgura del disco dosificador":                       "dosificacion-principal",
            "Holgura del bloqueador de polvo (powder blocker)":    "control-polvo",
            "Posición del detector de nivel de polvo":             "control-polvo",
            "Estado de los punzones":                              "dosificacion-principal"
          },
          "Cápsulas rotas o roce": {
            "Concentricidad de moldes superior e inferior": "torreta-moldes",
            "Altura de cierre":                             "cierre-bloqueo"
          },
          "Rechazo excesivo": {
            "Sincronía del expulsor de rechazo": "rechazo",
            "Holgura de varillas de rechazo":    "rechazo"
          },
          "Atascos en molde": {
            "Presión de aire de la aguja de limpieza": "descarga-limpieza",
            "Residuos en alojamientos del molde":      "torreta-moldes",
            "Desgaste del alojamiento del molde":      "torreta-moldes"
          },
          "Ruido anormal en aspiradora": {
            "Filtro de mangas / tela filtrante":    "aspiracion-polvo",
            "Hermeticidad de ductos y uniones":     "aspiracion-polvo"
          }
        }
      };

      function getAtlasFigure(machine, systemId) {
        return machine?.systemAtlas?.systems?.find(s => s.id === systemId)?.figure ?? null;
      }

      function getStepFigure(machine, failureName, stepTitle) {
        const sysId = STEP_IMAGE_REFS[machine?.id]?.[failureName]?.[stepTitle];
        return sysId ? getAtlasFigure(machine, sysId) : null;
      }

      // ── Guide Groups (ID-based, not fragile index-based) ──────────────────────
      const GUIDE_GROUPS = {
        njp3500: [
          { title: "¿Cómo funciona?", hint: "Qué hace la máquina, cómo lo hace paso a paso y el flujo entradas–salidas",
            ids: ["como-funciona","flujo-es","indicadores"] },
          { title: "Operación y seguridad", hint: "Arranque y paro paso a paso, bloqueo de energía (LOTO), mandos HMI y seguridad",
            ids: ["arranque-produccion","paro-vaciado","loto","mandos-hmi","seguridad"] },
          { title: "Ficha técnica", hint: "Identificación (placa), especificaciones y variables críticas de operación",
            ids: ["id-general","parametros","variables-criticas"] },
          { title: "Proceso de operación", hint: "Secuencia completa y cada estación de la torreta",
            ids: ["proceso-completo","estacion-alimentacion","estacion-molde","estacion-vacio","estacion-llenado","estacion-rechazo","estacion-cierre","estacion-descarga","estacion-limpieza"] },
          { title: "Instalación y puesta en marcha", hint: "Primera vez, commissioning y línea de equipos auxiliares",
            ids: ["instalacion-arranque","diagrama-linea"] },
          { title: "Ajustes y cambio de formato", hint: "Plan de mantenimiento por niveles, tolerancias críticas y cambio de formato",
            ids: ["plan-mantenimiento","mantenimiento-limpieza","cambio-formato"] },
          { title: "Componentes (referencia)", hint: "Componentes eléctricos y rodamientos por zona, según el manual",
            ids: ["electrico","rodamientos"] },
          { title: "Datos por confirmar", hint: "Lo que el manual NO da y hay que validar en planta",
            ids: ["pendientes"] }
        ],
        controlsa114rl: [
          { title: "Ficha técnica", hint: "Identificación y especificaciones técnicas de la puerta",
            ids: ["controlsa-id-general","controlsa-parametros"] },
          { title: "Operación y seguridad", hint: "Modos de operación, mandos y dispositivos de protección",
            ids: ["controlsa-funcionamiento","controlsa-seguridad"] },
          { title: "Mantenimiento y diagnóstico", hint: "Plan preventivo, guía de entradas, fallas comunes y repuestos",
            ids: ["controlsa-mantenimiento-guia","controlsa-entradas-diagnostico","controlsa-fallas-guia","controlsa-repuestos-guia"] }
        ],
        ms235: [
          { title: "Plano y alarma eléctrica", hint: "Contactor KM44.4 y anomalía telerruptor — diagnóstico paso a paso",
            ids: ["telerruptor-km444"] },
          { title: "Calibrado, formato y repuestos", hint: "Sincronizaciones, cambio de formato, piezas y materiales en contacto (5 manuales S4220003)",
            ids: ["ms235-resumen","ms235-calibrado","ms235-cambio-formato","ms235-recambios","ms235-materiales-contacto"] }
        ],
        gkf2600: [
          { title: "¿Cómo funciona?", hint: "Qué hace la máquina, cómo lo hace paso a paso y el flujo entradas–salidas",
            ids: ["gkf-como-funciona","gkf-flujo","gkf-estaciones"] },
          { title: "Ficha técnica", hint: "Identificación, datos técnicos, parámetros de ajuste y panel de mando",
            ids: ["gkf-ficha","gkf-parametros","gkf-hmi"] },
          { title: "Mantenimiento Bosch", hint: "Plan por horas, PM Kits, lubricación y los repuestos hallados en la inspección",
            ids: ["gkf-plan-mtto","gkf-pmkits","gkf-lubricacion","gkf-inspeccion-ago2026"] },
          { title: "Operación y seguridad", hint: "Cambio de formato, sistemas y bloqueo de energía (LOTO)",
            ids: ["gkf-cambio-formato","gkf-sistemas","gkf-seguridad"] },
          { title: "Datos por confirmar", hint: "Lo que la documentación no cubre y hay que validar en planta",
            ids: ["gkf-pendientes"] }
        ],
        integra320: [
          { title: "¿Cómo funciona?", hint: "El proceso de blisteado paso a paso y el flujo entradas–salidas",
            ids: ["int-como-funciona","int-flujo","int-estaciones"] },
          { title: "Calibración y formato", hint: "Verificación y restablecimiento de fases, cotas de ajuste y cambio de formato",
            ids: ["int-calibraciones","int-parametros","int-formato"] },
          { title: "Sistemas y visión", hint: "Sistemas de la máquina, sistema de visión SEA Vision y panel de mando",
            ids: ["int-sistemas","int-vision","int-hmi"] },
          { title: "Seguridad", hint: "Advertencias y condiciones de seguridad operativa",
            ids: ["int-seguridad"] }
        ]
      };

      const machineEditsKey = "equipos-machine-edits-v1";
      function loadMachineEdits() {
        try { return JSON.parse(localStorage.getItem(machineEditsKey) || "{}"); } catch { return {}; }
      }
      function saveMachineEditsToStorage(edits) {
        try { localStorage.setItem(machineEditsKey, JSON.stringify(edits)); } catch(e) {}
      }

      function renderGuideSection(section, num, machineId) {
        const edits = loadMachineEdits();
        const content = edits[machineId]?.[section.id] ?? section.content;
        return `
          <details class="guide-accordion" ${num === 1 ? "open" : ""} id="gsec-${section.id}">
            <summary>
              <span class="guide-accordion__num">${String(num).padStart(2,"0")}</span>
              <span>${section.title}</span>
            </summary>
            <div class="guide-accordion__body" id="gbody-${section.id}">
              <div class="editable-content" data-editable data-edit-store="section" data-section-id="${section.id}" data-machine-id="${machineId}">${content}</div>
            </div>
          </details>
        `;
      }

      function renderGuideAccordion(machine) {
        const sectionMap = Object.fromEntries((machine.guideSections ?? []).map(s => [s.id, s]));
        const groups = GUIDE_GROUPS[machine.id];

        if (!groups) {
          const sections = machine.guideSections ?? [];
          return `<div class="guide-group">
            <div class="guide-group-header"><h3>Guía del equipo</h3><p>${sections.length} secciones disponibles</p></div>
            ${sections.map((s, i) => renderGuideSection(s, i + 1, machine.id)).join("")}
          </div>`;
        }

        return groups.map(group => {
          const items = group.ids.map(id => sectionMap[id]).filter(Boolean);
          if (!items.length) return "";
          return `<div class="guide-group">
            <div class="guide-group-header"><h3>${group.title}</h3><p>${group.hint}</p></div>
            ${items.map((s, i) => renderGuideSection(s, i + 1, machine.id)).join("")}
          </div>`;
        }).join("");
      }

      // ===== Explorador de planos eléctricos (tipo EPLAN: navegar componentes y conexiones) =====
      const schSelected = {};
      function schGet(mid) { return (typeof SCHEMATICS !== "undefined") ? SCHEMATICS[mid] : null; }
      function schDev(sch, id) { return sch.devices.find(d => d.i === id); }
      function schEsc(id) { return String(id).replace(/['"\\]/g, ""); }

      // ===== Referencia comercial: detección automática + edición manual =====
      const commKey = "equipos-comerciales-v1";
      function loadComm() { try { return JSON.parse(localStorage.getItem(commKey) || "{}"); } catch { return {}; } }
      let commOverrides = loadComm();
      function saveComm() { try { localStorage.setItem(commKey, JSON.stringify(commOverrides)); } catch (e) {} }

      // Patrones de referencia comercial dentro de la descripción del catálogo
      const COMM_PATTERNS = [
        [/\b(XFM-\d{4}-\d{2})\b/, "igus"],
        [/\b(PAE\d+\w*)\b/, "INA"],
        [/\b(KR\d+\w*)\b/, "INA"],
        [/\b(PWKR\s?\d+[-\w]*)/, "INA"],
        [/\b(NA\d{4})\b/, "INA"],
        [/\b(CF-?\d+)\b/, "INA"],
        [/\b(\d{3,4}-8M-\d+)\b/, "correa HTD"],
        [/\b(CXP\s?8M-[\d-]+)/, "correa HTD"],
        [/\b(\d{3}-3M-\d+)\b/, "correa HTD"],
        [/\b(\d+T5\/\d+)\b/, "correa T5"],
        [/\b((?:6|3|1|5|62)\d{3}(?:-2RS1?|-2Z|-2RS|-ZZ)?)\b/, "rodamiento DIN"],
        [/\b(6\d{4}-2RS1?)\b/, "rodamiento DIN"],
        [/\b(IFS\s?\d+)\b/, "ifm"],
        [/\b(IEK\d+)\b/, "sensor"],
        [/\b(IQ\d{2}-[\w]+)\b/, "SICK"],
        [/\b(E2K-[\w-]+)\b/, "Omron"],
        [/\b(KAS-[\w./-]+)/, "sensor capacitivo"],
        [/\b(LGW\s?\d+\s?A\d)\b/, "Dungs"],
        [/\b(FFA\.\d\w\.\d+[\w.]*)/, "LEMO"],
        [/\b(FGG\.\d\w\.\d+[\w.]*)/, "LEMO"],
        [/\b(GMA\.\d\w\.\d+[\w.]*)/, "LEMO"],
        [/\b(HAN\d\w?)\b/, "HARTING"],
        [/\b(Micro-Top\s?[\w\s/-]*\d)/, "filtro"],
        [/\b(MCR\s?\d+[-.\d]*)/, "neumática"],
        [/\b(VK\s?\d+\/\d+)\b/, "válvula"],
        [/\b(PLN\d+[-\w]*)/, "Neugart"],
        [/\b(SH\d{3}\/\d+)\b/, "ELAU/Schneider"],
        [/\b(GKR\d+[-\w]*)/, "motorreductor"],
        [/\b(ELMO-\w+)\b/, "Siemens"],
        [/\b(BRF\d+L?)\b/, "rótula"],
        [/\b(KJL?\d+D)\b/, "cabezal articulado"],
        [/\b(KWSE\d+)\b/, "carro guía"],
        [/\b(TKSD\s?[\d/]+)/, "riel lineal"],
        [/\b(AFS60[\w-]+)/, "SICK encoder"],
        [/\b(IFK\d+)\b/, "sensor"],
        [/\b(TV10S[\s\w-]*)/, "interruptor seguridad"],
        [/\b(AL-[\w/-]+)/, "cable"],
        [/\b(BRE\.\d\w\.\d+[\w.]*)/, "LEMO"],
        [/\b(AIRDUC[\s\w]*)/, "Norres"],
        [/\b(CONDUFLEX)\b/, "manguera PVC"],
        [/\b(CAL-\w+)\b/, "casquillo"],
        [/\b(V-\d{3}S)\b/, "anillo V"],
        [/\b(KM\d+|MB\d+)\b/, "SKF tuerca/chapa"],
        [/\b(HN\d{4})\b/, "junta"],
        [/\b(MSAL\s?\d+\s?\w?)/, "iluminación"],
        [/\b(DA\d{2}-\d{2}-\d{2}|RH\d{2}-\d{2})\b/, "indicador"],
        [/n\.[º°]\s?([\w-]{6,})/, "n.º proveedor"],
        [/n[º°]\s?de pedido\s?([\w-]{5,})/, "n.º pedido"],
        [/tipo:?\s?([\w.\/-]{5,})/i, "tipo"],
      ];
      function detectComm(desc) {
        for (const [rx, marca] of COMM_PATTERNS) {
          const m = rx.exec(desc || "");
          if (m) return { v: m[1].trim(), b: marca };
        }
        return null;
      }
      function getComm(ref, desc) {
        const ov = commOverrides[ref];
        if (ov !== undefined) return { v: ov.v || "", b: ov.b || "", src: "manual" };
        const d = detectComm(desc);
        return d ? { v: d.v, b: d.b, src: "auto" } : { v: "", b: "", src: "none" };
      }
      function commCellHtml(ref, desc) {
        const c = getComm(ref, desc);
        const inner = c.v
          ? `<span class="cm-val ${c.src === "manual" ? "cm-val--manual" : ""}">${c.v}</span>${c.b ? `<span class="cm-tag cm-tag--${c.src === "manual" ? "manual" : "auto"}">${c.b}</span>` : ""}`
          : `<span class="cm-empty">+ añadir</span>`;
        return `<td class="cm-cell" data-ref="${ref}" title="Toca para editar la referencia comercial" onclick="commEdit(this,'${ref}')">${inner}</td>`;
      }
      function commEdit(td, ref) {
        if (td.querySelector("input")) return;
        const cur = getComm(ref, "");
        const ov = commOverrides[ref];
        const val = ov !== undefined ? (ov.v || "") : (td.querySelector(".cm-val")?.textContent || "");
        const brand = ov !== undefined ? (ov.b || "") : (td.querySelector(".cm-tag")?.textContent || "");
        td.innerHTML = `<input class="cm-input" value="${val.replace(/"/g, "&quot;")}" placeholder="ref. comercial" data-brand="${brand.replace(/"/g, "&quot;")}">`;
        const inp = td.querySelector("input");
        inp.focus(); inp.select();
        const commit = () => {
          const v = inp.value.trim();
          if (v) commOverrides[ref] = { v, b: inp.dataset.brand || "manual" };
          else delete commOverrides[ref];
          saveComm();
          td.outerHTML = commCellHtml(ref, td.getAttribute("data-desc") || "");
        };
        inp.addEventListener("blur", commit);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); inp.blur(); } if (e.key === "Escape") { td.outerHTML = commCellHtml(ref, ""); } });
      }
      function commStats(mid) {
        const M = getParts(mid); if (!M) return { auto: 0, manual: 0, total: 0 };
        let auto = 0, manual = 0;
        M.parts.forEach(p => { const c = getComm(p.r, p.d); if (c.src === "manual") manual++; else if (c.src === "auto") auto++; });
        return { auto, manual, total: M.parts.length };
      }
      function commExport() {
        const data = JSON.stringify(commOverrides, null, 2);
        try { navigator.clipboard?.writeText(data); } catch (e) {}
        window.prompt("Referencias comerciales que has añadido (cópialas para respaldar o compartir):", data);
      }
      function commImport(mid) {
        const txt = window.prompt("Pega aquí las referencias comerciales exportadas:");
        if (!txt) return;
        try {
          const obj = JSON.parse(txt);
          if (obj && typeof obj === "object") { commOverrides = { ...commOverrides, ...obj }; saveComm(); pxRefresh(mid); }
        } catch (e) { window.alert("El texto no es válido."); }
      }

      // ===== Código interno de la empresa (Farmacápsulas) =====
      // Cada repuesto tiene, además de la referencia del fabricante, un código con el que
      // se pide y se maneja en almacén. Aquí van los ya confirmados; el resto se escribe
      // a mano en la celda y queda guardado en el navegador del equipo.
      const INTERNAL_CODES = {
        "8-104-238-784": "724002338",
        "8-108-128-628": "724002339",
        "8-104-503-671": "724002340",
        "8-104-307-689": "7240022312",
        "8-108-168-189": "721703041",
        "8-108-136-291": "741203258",
        "8-108-148-303": "741203259",
        "8-108-137-973": "741203260",
        "8-108-136-023": "741203261",
        "8-108-136-292": "741203262",
        "8-101-210-194": "724002341",
        "8-108-160-149": "724002342",
        "8-108-148-977": "724002343"
      };
      const intKey = "equipos-codigos-internos-v1";
      function loadInt() { try { return JSON.parse(localStorage.getItem(intKey) || "{}"); } catch { return {}; } }
      let intOverrides = loadInt();
      function saveInt() { try { localStorage.setItem(intKey, JSON.stringify(intOverrides)); } catch (e) {} }
      function getInt(ref) {
        const ov = intOverrides[ref];
        if (ov !== undefined && ov !== "") return { v: ov, src: "manual" };
        if (INTERNAL_CODES[ref]) return { v: INTERNAL_CODES[ref], src: "base" };
        return { v: "", src: "none" };
      }
      function intCellHtml(ref) {
        const c = getInt(ref);
        const inner = c.v
          ? `<span class="ic-val ${c.src === "manual" ? "ic-val--manual" : ""}">${c.v}</span>`
          : `<span class="ic-empty">+ añadir</span>`;
        return `<td class="ic-cell" data-ref="${ref}" title="Código interno Farmacápsulas — toca para editar" onclick="intEdit(this,'${ref}')">${inner}</td>`;
      }
      function intEdit(td, ref) {
        if (td.querySelector("input")) return;
        const val = getInt(ref).v;
        td.innerHTML = `<input class="ic-input" value="${val.replace(/"/g, "&quot;")}" placeholder="código interno" inputmode="numeric">`;
        const inp = td.querySelector("input");
        inp.focus(); inp.select();
        const commit = () => {
          const v = inp.value.trim();
          if (v) intOverrides[ref] = v; else delete intOverrides[ref];
          saveInt();
          td.outerHTML = intCellHtml(ref);
        };
        inp.addEventListener("blur", commit);
        inp.addEventListener("keydown", e => {
          if (e.key === "Enter") { e.preventDefault(); inp.blur(); }
          if (e.key === "Escape") { td.outerHTML = intCellHtml(ref); }
        });
      }
      function intStats(mid) {
        const M = getParts(mid); if (!M) return { base: 0, manual: 0, total: 0 };
        let base = 0, manual = 0;
        const seen = new Set();
        M.parts.forEach(p => {
          if (seen.has(p.r)) return; seen.add(p.r);
          const c = getInt(p.r);
          if (c.src === "manual") manual++; else if (c.src === "base") base++;
        });
        return { base, manual, total: seen.size };
      }
      function intExport() {
        const all = { ...INTERNAL_CODES, ...intOverrides };
        const data = JSON.stringify(all, null, 2);
        try { navigator.clipboard?.writeText(data); } catch (e) {}
        window.prompt("Códigos internos Farmacápsulas (cópialos para respaldar o compartir):", data);
      }
      function intImport(mid) {
        const txt = window.prompt("Pega aquí los códigos internos exportados:");
        if (!txt) return;
        try {
          const obj = JSON.parse(txt);
          if (obj && typeof obj === "object") { intOverrides = { ...intOverrides, ...obj }; saveInt(); pxRefresh(mid); odRefreshBox(mid); }
        } catch (e) { window.alert("El texto no es válido."); }
      }

      // ===== Inspección de agosto de 2026: lo encontrado y lo que se cambia =====
      const GKF_INSPECCION = {
        id: "ago2026",
        titulo: "Inspección de agosto de 2026",
        nota: "Piezas revisadas en planta y aprobadas para cambio. El código interno es el que va en la solicitud a compras.",
        // La descripción, la cantidad y la página son las de la hoja de inspección, tal como se entregó.
        items: [
          { r: "8-104-238-784", d: "Cobertura de alimentación Bosch", q: "1", u: "Alimentación del polvo (grupo básico) — pág. 53" },
          { r: "8-108-128-628", d: "O-Ring alimentador Bosch (60,2x3,0 70MVQ 11507/FDA)", q: "1", u: "Alimentación del polvo (grupo básico) — pág. 53" },
          { r: "8-104-503-671", d: "Tubo de alimentación de polvo Bosch", q: "1", u: "Alimentación del polvo (grupo básico) — pág. 53" },
          { r: "8-104-307-689", d: "Soporte de raspador Bosch (Haltearm für Abstreifer FL)", q: "1", u: "Soporte para rascador completo — pág. 84" },
          { r: "8-108-168-189", d: "Presostato diferencial LGW 10 A2 (Dungs)", q: "1", u: "Estación de cierre (grupo básico) — pág. 106" },
          { r: "8-108-136-291", d: "Correa dentada Z=160, 1280-8M-50", q: "1", u: "Accionamiento estación de dosificación de polvo — pág. 41" },
          { r: "8-108-148-303", d: "Correa dentada CXP 8M-960-50 HTD", q: "2", u: "Accionamiento principal — pág. 36 / Est. dosificadora desconectable — pág. 129" },
          { r: "8-108-137-973", d: "Correa dentada Z=228, 684-3M-9", q: "1", u: "Accionamiento est. dosificadora desconectable — pág. 129" },
          { r: "8-108-136-023", d: "Correa dentada 10T5/885", q: "1", u: "Regulación del disco dosificador por motor — pág. 136" },
          { r: "8-108-136-292", d: "Correa dentada Z=150, 1200-8M-30", q: "1", u: "Accionamiento principal — pág. 35" },
          { r: "8-101-210-194", d: "Casquillo deslizante de collarín XFM-0405-06", q: "18", u: "Estación de expulsión de cápsulas conformes — pág. 111" },
          { r: "8-108-160-149", d: "Manguera de aspiración 38x1,5", q: "4 (aspiración) / 8 en toda la máquina", u: "Aspiración — pág. 81 (también Cierre, Limpieza segmentos, Expulsión defectuosas)" },
          { r: "8-108-148-977", d: "Manguera AIRDUC PUR 351 EL 70x4,5", q: "1", u: "Aspiración (grupo básico) — pág. 81" }
        ]
      };
      const inspRefs = new Set(GKF_INSPECCION.items.map(o => o.r));
      function isInsp(mid, ref) { return mid === "gkf2600" && inspRefs.has(ref); }

      // ===== Lista de pedido de repuestos =====
      const orderKey = "equipos-pedido-v1";
      const ORDER_SEED = [
        { ref: "8-104-238-784", d: "Cobertura del tubo de alimentación de polvo", w: "Est. 5 · Alimentación del polvo (grupo básico)", q: "1", n: "Inspección ago-2026 · plano pág. 53 del catálogo" },
        { ref: "8-108-128-628", d: "Anillo en O del alimentador 60,2x3,0 (70MVQ 11507/FDA)", w: "Est. 5 · Alimentación del polvo (grupo básico)", q: "1", n: "Inspección ago-2026 · se cambia con el tubo y la cobertura" },
        { ref: "8-104-503-671", d: "Tubo de alimentación de polvo", w: "Est. 5 · Alimentación del polvo (grupo básico)", q: "1", n: "Inspección ago-2026 · plano pág. 53 del catálogo" },
        { ref: "8-104-307-689", d: "Brazo soporte de rascador FL (Haltearm für Abstreifer FL)", w: "Est. 5 · Soporte para rascador completo", q: "1", n: "Inspección ago-2026 · plano pág. 84 del catálogo" },
        { ref: "8-108-168-189", d: "Presostato diferencial LGW 10A2 (Dungs)", w: "Est. 9 · Estación de cierre", q: "1", n: "Etiqueta de máquina =GKF1.G05-B13" },
        { ref: "8-108-125-802", d: "Bola de cabezal articulado I BRF8 (8/M8)", w: "Est. 10 y 11 · Expulsión", q: "1", n: "OJO: rosca DERECHA" },
        { ref: "8-108-125-924", d: "Bola de cabezal articulado I BRF8L (8/M8L)", w: "Est. 10 y 11 · Expulsión", q: "1", n: "OJO: rosca IZQUIERDA" },
        { ref: "8-101-210-194", d: "Casquillo deslizante de collarín XFM-0405-06", w: "Est. 10 y 11 · Expulsión de cápsulas conformes (pág. 111)", q: "18", n: "Inspección ago-2026 · se cambia junto con 8-104-236-330 y 8-108-100-311" },
        { ref: "8-104-236-330", d: "Anillo rascador 14x4/6", w: "Est. 10 y 11 · Expulsión", q: "18", n: "" },
        { ref: "8-108-100-311", d: "Casquillo de bolas 12x19", w: "Est. 10 y 11 · Expulsión", q: "36", n: "" },
        { ref: "8-108-160-149", d: "Manguera de aspiración 38x1,5", w: "Aspiración (pág. 81) · también cierre, limpieza de segmentos y expulsión de defectuosas", q: "4", n: "Inspección ago-2026 · 4 en aspiración; la máquina lleva 8 en total (4+2+1+1)" },
        { ref: "8-108-148-977", d: "Manguera AIRDUC PUR 351 EL 70x4,5", w: "Aspiración (grupo básico) — pág. 81", q: "1", n: "Inspección ago-2026" },
        { ref: "8-104-233-011", d: "Soporte de bloque de clasificación", w: "Est. 1 y 2 · Clasificación", q: "1", n: "" },
        { ref: "8-108-643-460", d: "Cartucho de filtro Micro-Top C 15-124/1", w: "Vacío · filtro", q: "1", n: "Consumible del filtro de vacío" },
        { ref: "8-108-136-294", d: "Filtro de vacío completo", w: "Vacío de la estación de separación", q: "1", n: "" },
        { ref: "8-108-136-292", d: "Correa dentada Z=150 · 1200-8M-30", w: "Accionamiento principal", q: "1", n: "Correa 1 de 5" },
        { ref: "8-108-148-303", d: "Correa dentada CXP 8M-960-50 HTD", w: "Accionamiento principal y est. dosificadora", q: "2", n: "Correa 2 de 5 · va en 2 sitios" },
        { ref: "8-108-136-291", d: "Correa dentada Z=160 · 1280-8M-50", w: "Accionamiento dosificación de polvo", q: "1", n: "Correa 3 de 5" },
        { ref: "8-108-137-973", d: "Correa dentada Z=228 · 684-3M-9", w: "Accionamiento est. dosificadora desconectable", q: "1", n: "Correa 4 de 5" },
        { ref: "8-108-136-023", d: "Correa dentada 10T5/885", w: "Regulación del disco dosificador por motor", q: "1", n: "Correa 5 de 5" }
      ];
      // Marca de la última tanda sembrada: si el equipo ya tenía la lista guardada de antes,
      // le añadimos sólo las piezas nuevas de la inspección sin tocar lo que ya trabajó.
      const orderSeedKey = "equipos-pedido-seed-ago2026-v2";
      function loadOrder() {
        try {
          const raw = localStorage.getItem(orderKey);
          if (raw === null) {
            const seed = ORDER_SEED.map(o => ({ ...o, m: "gkf2600", s: "por-pedir" }));
            localStorage.setItem(orderKey, JSON.stringify(seed));
            localStorage.setItem(orderSeedKey, "1");
            return seed;
          }
          const list = JSON.parse(raw) || [];
          if (localStorage.getItem(orderSeedKey) !== "1") {
            const have = new Set(list.map(o => o.ref));
            ORDER_SEED.forEach(o => {
              if (inspRefs.has(o.ref) && !have.has(o.ref)) list.push({ ...o, m: "gkf2600", s: "por-pedir" });
            });
            localStorage.setItem(orderKey, JSON.stringify(list));
            localStorage.setItem(orderSeedKey, "1");
          }
          return list;
        } catch { return []; }
      }
      let orderList = loadOrder();
      function saveOrder() { try { localStorage.setItem(orderKey, JSON.stringify(orderList)); } catch (e) {} }
      function odIn(ref) { return orderList.some(o => o.ref === ref); }
      function odCount(mid) { return orderList.filter(o => !mid || o.m === mid).length; }

      function renderOrderBox(mid) {
        const list = orderList.filter(o => o.m === mid);
        const pend = list.filter(o => o.s === "por-pedir").length;
        const ped = list.filter(o => o.s === "pedido").length;
        const rec = list.filter(o => o.s === "recibido").length;
        const rows = list.map((o, i) => {
          const gi = orderList.indexOf(o);
          const ic = getInt(o.ref);
          return `<tr class="st-${o.s}">
            <td>${ic.v ? `<span class="ic-chip">${ic.v}</span>` : '<span class="od-where">—</span>'}</td>
            <td class="px-ref">${o.ref}</td>
            <td>${o.d}${isInsp(o.m, o.ref) ? '<span class="insp-tag">🔧 insp. ago-2026</span>' : ""}${o.n ? `<div class="od-where">📝 ${o.n}</div>` : ""}</td>
            <td class="od-where">${o.w || ""}</td>
            <td><input class="od-qty" type="text" value="${o.q || ""}" onchange="odSetQty(${gi}, this.value)"></td>
            <td><select class="od-sel" onchange="odSetStatus(${gi}, this.value)">
              <option value="por-pedir" ${o.s === "por-pedir" ? "selected" : ""}>Por pedir</option>
              <option value="pedido" ${o.s === "pedido" ? "selected" : ""}>Pedido</option>
              <option value="recibido" ${o.s === "recibido" ? "selected" : ""}>Recibido</option>
            </select></td>
            <td><button class="od-del" type="button" title="Quitar" onclick="odRemove(${gi})">×</button></td>
          </tr>`;
        }).join("");
        return `<details class="od-box" id="odBox" ${list.length ? "open" : ""}>
          <summary>
            <span class="od-box__t">🧾 Lista de pedido de repuestos</span>
            <span class="od-badge ${list.length ? "" : "od-badge--0"}">${list.length} pieza${list.length === 1 ? "" : "s"}</span>
            ${pend ? `<span class="od-badge">${pend} por pedir</span>` : ""}
            ${ped ? `<span class="od-badge" style="background:#eff6ff;color:#1d4ed8">${ped} pedido${ped === 1 ? "" : "s"}</span>` : ""}
            ${rec ? `<span class="od-badge" style="background:#f0fdf4;color:#15803d">${rec} recibido${rec === 1 ? "" : "s"}</span>` : ""}
          </summary>
          <div class="od-body">
            <p style="font-size:0.84rem;color:var(--muted);margin:10px 0 0">Añade piezas con el botón <strong>+ pedido</strong> de cada fila del despiece. Se guarda en este equipo; usa <strong>Copiar para compras</strong> para enviarla.</p>
            <div class="od-actions">
              <button class="button button--dark" type="button" onclick="odExport('${mid}')">📋 Copiar para compras</button>
              <button class="button button--light" type="button" onclick="odClear('${mid}')">Vaciar lista</button>
            </div>
            ${list.length ? `<div class="table-container"><table class="od-tbl">
              <thead><tr><th>Cód. interno</th><th>Ref. Bosch</th><th>Pieza</th><th>Dónde va</th><th>Cant.</th><th>Estado</th><th></th></tr></thead>
              <tbody>${rows}</tbody></table></div>` : '<p class="tk-empty">La lista está vacía. Busca una pieza abajo y pulsa <strong>+ pedido</strong>.</p>'}
          </div>
        </details>`;
      }
      function odRefreshBox(mid) {
        const box = document.getElementById("odBox");
        if (box) { const wasOpen = box.open; box.outerHTML = renderOrderBox(mid); const nb = document.getElementById("odBox"); if (nb) nb.open = wasOpen || true; }
      }
      function odAdd(mid, ref, d, w, q) {
        if (odIn(ref)) { odRemoveByRef(ref); }
        else { orderList.push({ ref, d, w, q: (q || "").replace(/[^\d]/g, "") || "1", n: "", m: mid, s: "por-pedir" }); saveOrder(); }
        odRefreshBox(mid); pxRefresh(mid);
      }
      function odRemoveByRef(ref) { orderList = orderList.filter(o => o.ref !== ref); saveOrder(); }
      function odRemove(i) { const mid = orderList[i]?.m; orderList.splice(i, 1); saveOrder(); odRefreshBox(mid); pxRefresh(mid); }
      function odSetQty(i, v) { if (orderList[i]) { orderList[i].q = v; saveOrder(); } }
      function odSetStatus(i, v) { if (orderList[i]) { orderList[i].s = v; saveOrder(); odRefreshBox(orderList[i].m); } }
      function odClear(mid) { if (window.confirm("¿Vaciar la lista de pedido de este equipo?")) { orderList = orderList.filter(o => o.m !== mid); saveOrder(); odRefreshBox(mid); pxRefresh(mid); } }
      function odExport(mid) {
        const m = machines.find(x => x.id === mid);
        const list = orderList.filter(o => o.m === mid && o.s !== "recibido");
        if (!list.length) { window.alert("No hay piezas por pedir en la lista."); return; }
        const head = `PEDIDO DE REPUESTOS\nEquipo: ${m ? m.name : mid}${m && m.technicalData?.serialNumber ? ` · N.º de serie ${m.technicalData.serialNumber}` : ""}\nFecha: ${new Date().toLocaleDateString("es-CO")}\nCada línea va con el código interno Farmacápsulas primero y la referencia del fabricante entre paréntesis.\n`;
        const body = list.map((o, i) => {
          const c = getComm(o.ref, o.d);
          const ic = getInt(o.ref);
          const cLine = c.v ? `\n   Equivalente comercial: ${c.v}${c.b ? ` (${c.b})` : ""}` : "";
          const head = ic.v ? `${ic.v}  (Bosch ${o.ref})` : `${o.ref}  (sin código interno asignado)`;
          return `${i + 1}. ${head}  —  ${o.d}\n   Cantidad: ${o.q}   |   Ubicación: ${o.w || "—"}${cLine}${o.n ? `\n   Nota: ${o.n}` : ""}`;
        }).join("\n");
        const txt = `${head}\n${body}\n\nTotal: ${list.length} referencias.`;
        try { navigator.clipboard?.writeText(txt); } catch (e) {}
        window.prompt("Lista copiada. Puedes pegarla en el correo o WhatsApp de compras:", txt);
      }

      // ===== Explorador de despiece: mapa de la máquina <-> repuestos (bidireccional) =====
      const pxState = { station: "S5", hits: [], hitRefs: new Set() };
      function getParts(mid) { return (typeof MACHINE_PARTS !== "undefined" && MACHINE_PARTS[mid]) || null; }
      // Posiciones de las estaciones en el diagrama circular
      const PX_POS = {
        S1: [200, 45], S3: [298, 93], S5: [321, 200], S7: [251, 284],
        S9: [141, 280], S10: [77, 192], S12: [107, 86]
      };
      const PX_AUX = ["T", "A", "N", "C", "E", "F"];

      function pxMapSvg(mid) {
        const M = getParts(mid); if (!M) return "";
        const byId = Object.fromEntries(M.stations.map(s => [s.id, s]));
        const count = {};
        const gst = Object.fromEntries(M.groups.map(g => [g.p, g.st]));
        M.parts.forEach(p => { const st = gst[p.g]; if (st) count[st] = (count[st] || 0) + 1; });

        let ring = "";
        Object.entries(PX_POS).forEach(([id, [x, y]]) => {
          const s = byId[id]; if (!s) return;
          const sel = pxState.station === id ? " is-sel" : "";
          const hit = pxState.hitRefs.size && pxState.hits.some(h => h.st === id) ? " is-hit" : "";
          ring += `<g class="px-st${sel}${hit}" onclick="pxSelectStation('${mid}','${id}')">
            <circle cx="${x}" cy="${y}" r="30"/>
            <text class="px-st-n" x="${x}" y="${y - 2}">${s.no}</text>
            <text x="${x}" y="${y + 12}" style="font-size:9px;fill:var(--muted)">${count[id] || 0} pz</text>
          </g>`;
        });
        // Torreta al centro
        const tSel = pxState.station === "T" ? " is-sel" : "";
        const tHit = pxState.hits.some(h => h.st === "T") ? " is-hit" : "";
        const core = `<circle class="px-core" cx="200" cy="170" r="72"/>
          <g class="px-st${tSel}${tHit}" onclick="pxSelectStation('${mid}','T')">
            <circle cx="200" cy="170" r="34"/>
            <text x="200" y="167" style="font-size:10px">TORRETA</text>
            <text x="200" y="180" style="font-size:9px;fill:var(--muted)">${count.T || 0} pz</text>
          </g>`;
        // Zonas auxiliares abajo
        const auxIds = PX_AUX.filter(a => a !== "T");
        let aux = "";
        auxIds.forEach((id, i) => {
          const s = byId[id]; if (!s) return;
          const x = 8 + i * 78, y = 330;
          const sel = pxState.station === id ? " is-sel" : "";
          const hit = pxState.hits.some(h => h.st === id) ? " is-hit" : "";
          const label = { A: "Accionam.", N: "Neumát./vacío", C: "Alim. cáps.", E: "Estructura", F: "Formato" }[id] || id;
          aux += `<g class="px-st${sel}${hit}" onclick="pxSelectStation('${mid}','${id}')">
            <rect x="${x}" y="${y}" width="72" height="42" rx="9"/>
            <text x="${x + 36}" y="${y + 19}" style="font-size:9.5px">${label}</text>
            <text x="${x + 36}" y="${y + 32}" style="font-size:9px;fill:var(--muted)">${count[id] || 0} pz</text>
          </g>`;
        });
        return `<svg class="px-map" viewBox="0 0 400 385" preserveAspectRatio="xMidYMid meet">
          <circle cx="200" cy="170" r="125" fill="none" class="px-arrow"/>
          ${core}${ring}
          <text x="200" y="315" style="font-size:9px;fill:var(--muted);text-anchor:middle">— zonas auxiliares —</text>
          ${aux}
        </svg>`;
      }

      function pxGroupsHtml(mid, stId) {
        const M = getParts(mid);
        const st = M.stations.find(s => s.id === stId);
        const grps = M.groups.filter(g => g.st === stId);
        const partsByG = {};
        M.parts.forEach(p => { (partsByG[p.g] = partsByG[p.g] || []).push(p); });
        const total = grps.reduce((n, g) => n + (partsByG[g.p] || []).length, 0);
        const body = grps.map((g, i) => {
          const list = partsByG[g.p] || [];
          const anyHit = list.some(p => pxState.hitRefs.has(p.r));
          const stLabel = (M.stations.find(s => s.id === stId) || {});
          const wLabel = (stLabel.no && stLabel.no !== "—" ? "Est. " + stLabel.no + " · " : "") + (stLabel.n || "");
          const rows = list.map(p => {
            const inOrder = odIn(p.r);
            const safeD = (p.d || "").replace(/'/g, "");
            const insp = isInsp(mid, p.r);
            return `
            <tr class="${pxState.hitRefs.has(p.r) ? "is-hit" : ""}${insp ? " is-insp" : ""}" id="pxr-${p.r}">
              ${intCellHtml(p.r)}
              <td class="px-ref">${p.r}</td>
              <td>${p.d}${p.x ? ` <small style="color:var(--muted)">${p.x}</small>` : ""}${insp ? '<span class="insp-tag">🔧 insp. ago-2026</span>' : ""}</td>
              ${commCellHtml(p.r, p.d)}
              <td style="white-space:nowrap">${p.q || ""}</td>
              <td>${p.c ? `<span class="px-cls px-cls--${p.c}">${p.c}</span>` : (p.s === "plano" ? '<span class="px-src">plano</span>' : "")}</td>
              <td><button class="od-add${inOrder ? " is-in" : ""}" type="button" onclick="odAdd('${mid}','${p.r}','${safeD}','${wLabel.replace(/'/g, "")}','${p.q || ""}')">${inOrder ? "✓ en lista" : "+ pedido"}</button></td>
            </tr>`;
          }).join("");
          const figs = (g.img || []).map((src, k) => `
            <figure class="px-fig" onclick="openLightbox('${src}','Despiece ${g.p} · ${g.n.replace(/'/g, "")}')">
              <img src="${src}" alt="Despiece de ${g.n}" loading="lazy">
              <figcaption>🔍 Despiece del catálogo${(g.img.length > 1) ? ` (${k + 1}/${g.img.length})` : ""} — toca para ampliar</figcaption>
            </figure>`).join("");
          return `<details class="px-grp" ${(anyHit || (grps.length <= 3 && i === 0)) ? "open" : ""}>
            <summary>
              <span class="px-grp__path">${g.p}</span>
              <span class="px-grp__n">${g.n}</span>
              ${g.img ? '<span class="px-hasimg">🖼️ plano</span>' : ""}
              <span class="px-grp__c">${list.length} pz · pág. ${g.pag}</span>
            </summary>
            <div class="px-grp__body">
              ${figs}
              <table class="px-tbl"><thead><tr><th>Cód. interno ✎</th><th>Ref. Bosch</th><th>Pieza</th><th>Ref. comercial ✎</th><th>Cant.</th><th>Tipo</th><th>Pedido</th></tr></thead>
              <tbody>${rows}</tbody></table>
            </div>
          </details>`;
        }).join("");
        return `<div class="px-sthead">
            <h4>${st ? (st.no !== "—" ? "Estación " + st.no + " · " : "") + st.n : stId}</h4>
            <p>${st ? st.d : ""}</p>
            <p style="margin-top:6px"><strong>${grps.length}</strong> conjuntos · <strong>${total}</strong> piezas en el catálogo</p>
          </div>${body || '<p class="tk-empty">Sin conjuntos en esta zona.</p>'}`;
      }

      // Panel con lo hallado en la inspección: código interno, referencia Bosch y dónde va cada pieza.
      function renderInspBox(mid) {
        if (mid !== "gkf2600") return "";
        const M = getParts(mid); if (!M) return "";
        const byRef = {}; M.parts.forEach(p => { if (!byRef[p.r]) byRef[p.r] = p; });
        const gst = Object.fromEntries(M.groups.map(g => [g.p, g.st]));
        const rows = GKF_INSPECCION.items.map(it => {
          const p = byRef[it.r];
          const ic = getInt(it.r);
          return `<tr>
            <td>${ic.v ? `<span class="ic-chip">${ic.v}</span>` : '<span class="od-where">—</span>'}</td>
            <td class="px-ref">${it.r}</td>
            <td>${it.d}${p && p.s === "plano" ? ' <span class="px-src">plano</span>' : ""}</td>
            <td style="white-space:nowrap;font-weight:700">${it.q}</td>
            <td class="od-where">${it.u}</td>
            <td>${p ? `<button class="insp-go" type="button" onclick="pxGoToPart('${mid}','${it.r}','${gst[p.g]}')">Ver en el despiece</button>` : ""}</td>
          </tr>`;
        }).join("");
        return `<details class="insp-box" open>
          <summary>
            <span class="insp-box__t">🔧 ${GKF_INSPECCION.titulo} — repuestos a cambiar</span>
            <span class="insp-badge">${GKF_INSPECCION.items.length} referencias</span>
          </summary>
          <div class="insp-body">
            <p style="font-size:0.84rem;color:var(--muted);margin:10px 0 0">${GKF_INSPECCION.nota} Todas están ya en la lista de pedido y marcadas <span class="insp-tag">🔧 insp. ago-2026</span> dentro del despiece.</p>
            <div class="table-container"><table class="insp-tbl">
              <thead><tr><th>Cód. interno Farmacápsulas</th><th>Código Bosch</th><th>Descripción</th><th>Cant.</th><th>Ubicación en el catálogo</th><th></th></tr></thead>
              <tbody>${rows}</tbody></table></div>
          </div>
        </details>`;
      }

      function renderPartsExplorer(machine) {
        const M = getParts(machine.id); if (!M) return "<p>Este equipo no tiene despiece cargado.</p>";
        return `
          <div class="panel-header-clean">
            <h3>Despiece interactivo — dónde va cada repuesto</h3>
            <p>Toca una <strong>estación del diagrama</strong> para ver qué piezas lleva, o <strong>busca una referencia</strong> y te muestro en qué estación va. Catálogo ${M.ref} · ${M.parts.length} piezas.</p>
          </div>
          ${renderInspBox(machine.id)}
          ${renderOrderBox(machine.id)}
          ${(() => { const s = intStats(machine.id); return `<div class="ic-bar">
            <span>🏷️ <strong>Código interno Farmacápsulas:</strong> ${s.base} ya cargados · ${s.manual} añadidos por ti · de ${s.total} referencias del catálogo.</span>
            <span>Toca la celda <em>Cód. interno</em> para escribirlo. También puedes buscar por él.</span>
            <button class="button button--light" type="button" onclick="intExport()">Exportar códigos internos</button>
            <button class="button button--light" type="button" onclick="intImport('${machine.id}')">Importar</button>
          </div>`; })()}
          ${(() => { const s = commStats(machine.id); return `<div class="cm-bar">
            <span>🔎 <strong>Referencia comercial:</strong> ${s.auto} detectadas del catálogo · ${s.manual} añadidas por ti · de ${s.total} piezas.</span>
            <span>Toca la celda <em>Ref. comercial</em> para escribirla o corregirla.</span>
            <button class="button button--light" type="button" onclick="commExport()">Exportar mis referencias</button>
            <button class="button button--light" type="button" onclick="commImport('${machine.id}')">Importar</button>
          </div>`; })()}
          <div class="px-search">
            <input id="pxSearch" type="search" placeholder="Busca código interno (741203262), referencia Bosch (8-108-160-149) o nombre (correa, filtro)…" oninput="pxSearch('${machine.id}')" />
          </div>
          <div id="pxHits"></div>
          <div class="px-body">
            <div>
              <div class="px-mapwrap" id="pxMap">${pxMapSvg(machine.id)}</div>
              <p class="px-legend">Diagrama de las 12 estaciones · toca una zona</p>
              ${M.overview ? `<figure class="px-overview" onclick="openLightbox('${M.overview}','Configuración de las 12 estaciones — manual GKF 2600')">
                <img src="${M.overview}" alt="Configuración de las estaciones de la GKF 2600" loading="lazy">
                <figcaption>🔍 Vista real del manual — toca para ampliar</figcaption>
              </figure>` : ""}
            </div>
            <div class="px-panel" id="pxPanel">${pxGroupsHtml(machine.id, pxState.station)}</div>
          </div>`;
      }

      function pxRefresh(mid) {
        const m = document.getElementById("pxMap"); if (m) m.innerHTML = pxMapSvg(mid);
        const p = document.getElementById("pxPanel"); if (p) p.innerHTML = pxGroupsHtml(mid, pxState.station);
      }
      function pxSelectStation(mid, stId) {
        pxState.station = stId;
        pxRefresh(mid);
        document.getElementById("pxPanel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      function pxSearch(mid) {
        const M = getParts(mid);
        const raw = (document.getElementById("pxSearch")?.value || "").trim();
        const q = normalize(raw).replace(/-/g, "");
        const box = document.getElementById("pxHits");
        if (!q) { pxState.hits = []; pxState.hitRefs = new Set(); if (box) box.innerHTML = ""; pxRefresh(mid); return; }
        const gst = Object.fromEntries(M.groups.map(g => [g.p, g.st]));
        const gname = Object.fromEntries(M.groups.map(g => [g.p, g.n]));
        const stName = Object.fromEntries(M.stations.map(s => [s.id, (s.no !== "—" ? "Est. " + s.no + " · " : "") + s.n]));
        const hits = M.parts
          .filter(p => normalize(p.r).replace(/-/g, "").includes(q)
            || normalize(p.d).includes(normalize(raw))
            || (getInt(p.r).v && normalize(getInt(p.r).v).includes(q)))
          .map(p => ({ ...p, st: gst[p.g], stn: stName[gst[p.g]] || "", gn: gname[p.g] || "" }));
        pxState.hits = hits;
        pxState.hitRefs = new Set(hits.map(h => h.r));
        if (box) {
          box.innerHTML = hits.length
            ? `<p style="font-size:0.84rem;color:var(--muted);font-weight:700;margin:0 0 6px">${hits.length} resultado${hits.length === 1 ? "" : "s"} — toca uno para ver dónde va</p>
               <div class="px-hits">${hits.slice(0, 12).map(h => `
                 <button class="px-hit" type="button" onclick="pxGoToPart('${mid}','${h.r}','${h.st}')">
                   <span class="px-ref">${h.r}</span>
                   ${getInt(h.r).v ? `<span class="ic-chip">interno ${getInt(h.r).v}</span>` : ""}
                   <span class="px-hit__d">${h.d}${h.q ? ` · ${h.q}` : ""}</span>
                   <span class="px-hit__st">📍 ${h.stn}</span>
                 </button>`).join("")}</div>
               ${hits.length > 12 ? `<p style="font-size:0.78rem;color:var(--muted)">Mostrando 12 de ${hits.length}</p>` : ""}`
            : '<p class="tk-empty">No encontré esa referencia en el catálogo. Puede ser de un equipo externo (aspiradora, filtros) o del catálogo de PM Kits.</p>';
        }
        pxRefresh(mid);
      }
      function pxGoToPart(mid, ref, stId) {
        pxState.station = stId;
        pxRefresh(mid);
        setTimeout(() => {
          const row = document.getElementById("pxr-" + ref);
          if (row) { row.closest("details")?.setAttribute("open", ""); row.scrollIntoView({ behavior: "smooth", block: "center" }); }
        }, 60);
      }

      // ===== Despiece por tablas (catálogo Marchesini): buscar código -> tabla -> plano =====
      const tbState = { sel: 0, q: "" };
      function getTables(mid) { return (typeof MACHINE_TABLES !== "undefined" && MACHINE_TABLES[mid]) || null; }
      function tbCardHtml(mid, i) {
        const M = getTables(mid); const t = M.tablas[i]; if (!t) return "";
        const codes = Object.keys(M.idx).filter(c => M.idx[c].includes(i)).sort();
        const q = tbState.q;
        return `<div class="tb-detail">
          <div class="tb-head">
            <div><span class="tb-id">${t.id}</span> ${t.r ? `<span class="tb-rev">rev. ${t.r}</span>` : ""} <span class="tb-pag">pág. ${t.p} del catálogo${t.f ? ` · ${t.f}` : ""}</span></div>
            <span class="tb-n">${codes.length} códigos</span>
          </div>
          <figure class="px-fig" onclick="openLightbox('${t.img}','Tabla ${t.id} · pág. ${t.p} — catálogo Integra 320')">
            <img src="${t.img}" alt="Despiece tabla ${t.id}" loading="lazy">
            <figcaption>🔍 Plano de despiece — toca para ampliar</figcaption>
          </figure>
          <div class="tb-codes">${codes.map(c => `<button class="tb-code${q && c === q ? " is-hit" : ""}" type="button" onclick="tbSearchCode('${mid}','${c}')">${c}</button>`).join("")}</div>
        </div>`;
      }
      function tbListHtml(mid, filter = "") {
        const M = getTables(mid);
        const f = normalize(filter);
        const items = M.tablas.map((t, i) => ({ t, i })).filter(({ t }) => !f || normalize(t.id).includes(f));
        return items.slice(0, 400).map(({ t, i }) => `
          <button class="tb-item ${i === tbState.sel ? "is-sel" : ""}" type="button" onclick="tbSelect('${mid}',${i})">
            <span class="tb-item__id">${t.id}</span>
            <span class="tb-item__n">${t.n} pz · p.${t.p}</span>
          </button>`).join("") || '<p style="padding:10px;color:var(--muted)">Sin tablas.</p>';
      }
      function renderTablesExplorer(machine) {
        const M = getTables(machine.id); if (!M) return "";
        return `
          <div class="panel-header-clean">
            <h3>Despiece del catálogo — ${M.tablas.length} tablas</h3>
            <p>Busca un <strong>código de pieza</strong> y te muestro en qué tabla del catálogo está, con su plano. Catálogo ${M.ref} · ${Object.keys(M.idx).length} códigos indexados.</p>
          </div>
          <div class="px-search">
            <input id="tbSearch" type="search" placeholder="Código de pieza (104100703, M4M11106140, V812004008) o nº de tabla…" oninput="tbSearch('${machine.id}')">
          </div>
          <div id="tbHits"></div>
          <div class="tb-body">
            <div class="tb-list" id="tbList">${tbListHtml(machine.id)}</div>
            <div class="tb-panel" id="tbPanel">${tbCardHtml(machine.id, tbState.sel)}</div>
          </div>`;
      }
      function tbSelect(mid, i) {
        tbState.sel = i;
        const p = document.getElementById("tbPanel"); if (p) p.innerHTML = tbCardHtml(mid, i);
        const l = document.getElementById("tbList");
        if (l) l.querySelectorAll(".tb-item").forEach((b, k) => b.classList.toggle("is-sel", b.querySelector(".tb-item__id")?.textContent === getTables(mid).tablas[i].id));
        p?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      function tbSearch(mid) {
        const M = getTables(mid);
        const raw = (document.getElementById("tbSearch")?.value || "").trim().toUpperCase();
        const box = document.getElementById("tbHits");
        tbState.q = raw;
        if (!raw) { if (box) box.innerHTML = ""; const l = document.getElementById("tbList"); if (l) l.innerHTML = tbListHtml(mid); return; }
        const exact = M.idx[raw];
        const partial = Object.keys(M.idx).filter(c => c !== raw && c.includes(raw)).slice(0, 24);
        let html = "";
        if (exact) {
          html += `<p class="tb-found">✅ <strong>${raw}</strong> está en ${exact.length} tabla${exact.length === 1 ? "" : "s"}:</p><div class="px-hits">` +
            exact.map(i => `<button class="px-hit" type="button" onclick="tbSelect('${mid}',${i})">
              <span class="px-ref">${M.tablas[i].id}</span>
              <span class="px-hit__d">${M.tablas[i].n} códigos en esta tabla</span>
              <span class="px-hit__st">📄 pág. ${M.tablas[i].p}</span></button>`).join("") + `</div>`;
          tbSelect(mid, exact[0]);
        }
        if (partial.length) {
          html += `<p class="tb-found" style="margin-top:8px">Parecidos: ${partial.map(c => `<button class="tb-code" type="button" onclick="tbSearchCode('${mid}','${c}')">${c}</button>`).join(" ")}</p>`;
        }
        if (!exact && !partial.length) {
          const tabs = M.tablas.map((t, i) => ({ t, i })).filter(({ t }) => t.id.toUpperCase().includes(raw));
          html = tabs.length
            ? `<p class="tb-found">Tablas que coinciden:</p><div class="px-hits">${tabs.slice(0, 12).map(({ t, i }) => `<button class="px-hit" type="button" onclick="tbSelect('${mid}',${i})"><span class="px-ref">${t.id}</span><span class="px-hit__st">📄 pág. ${t.p}</span></button>`).join("")}</div>`
            : '<p class="tk-empty">No encontré ese código en el catálogo. Revisa el número o búscalo en el PDF de piezas de recambio.</p>';
        }
        if (box) box.innerHTML = html;
      }
      function tbSearchCode(mid, code) {
        const inp = document.getElementById("tbSearch");
        if (inp) { inp.value = code; tbSearch(mid); }
      }

      // ===== Alarmas del HMI: buscador por código o texto =====
      function getAlarms(mid) { return (typeof MACHINE_ALARMS !== "undefined" && MACHINE_ALARMS[mid]) || []; }
      function alarmCards(list) {
        if (!list.length) return '<p class="tk-empty">No hay alarmas que coincidan. Prueba con el número que muestra la pantalla (ej. <strong>63</strong>) o una palabra (ej. <strong>vacío</strong>).</p>';
        return list.map(a => `
          <details class="al-card">
            <summary>
              <span class="al-code">${a.c}</span>
              <span class="al-title">${a.t}</span>
              ${a.p ? `<span class="al-pag">manual pág. ${a.p}</span>` : ""}
            </summary>
            <div class="al-body">${a.b}</div>
          </details>`).join("");
      }
      function renderAlarmsPanel(machine) {
        const all = getAlarms(machine.id);
        return `
          <div class="panel-header-clean">
            <h3>Alarmas del panel de mando (HMI)</h3>
            <p>Las <strong>${all.length} alarmas</strong> del manual con su causa y su remedio. Cuando la pantalla muestre un número de fallo, escríbelo aquí.</p>
          </div>
          <div class="al-search">
            <input id="alSearch" type="search" inputmode="numeric" placeholder="Número de fallo (ej. 63) o palabra (ej. vacío, cierre, segmento)…" oninput="filterAlarms('${machine.id}')" />
            <span class="al-count" id="alCount">${all.length} alarmas</span>
          </div>
          <div class="al-list" id="alList">${alarmCards(all.slice(0, 40))}</div>
          <p class="sv-hint" id="alHint">${all.length > 40 ? "Mostrando las primeras 40 — busca para filtrar." : ""}</p>`;
      }
      function filterAlarms(mid) {
        const all = getAlarms(mid);
        const raw = (document.getElementById("alSearch")?.value || "").trim();
        const q = normalize(raw);
        let list;
        if (!q) {
          list = all.slice(0, 40);
        } else if (/^\d+$/.test(raw)) {
          const exact = all.filter(a => a.c === raw);
          const partial = all.filter(a => a.c !== raw && a.c.includes(raw));
          list = [...exact, ...partial];
        } else {
          list = all.filter(a => normalize(a.t + " " + a.b).includes(q));
        }
        const el = document.getElementById("alList");
        if (el) el.innerHTML = alarmCards(list.slice(0, 60));
        const c = document.getElementById("alCount");
        if (c) c.textContent = q ? `${list.length} coincidencia${list.length === 1 ? "" : "s"}` : `${all.length} alarmas`;
        const h = document.getElementById("alHint");
        if (h) h.textContent = list.length > 60 ? "Mostrando 60 de " + list.length + " — afina la búsqueda." : "";
      }

      function renderSchematicExplorer(machine) {
        const sch = schGet(machine.id);
        if (!sch) return "<p>Este equipo no tiene plano eléctrico cargado.</p>";
        const sel = schSelected[machine.id] || (schDev(sch, "KM44.4") ? "KM44.4" : sch.devices[0]?.i);
        schSelected[machine.id] = sel;
        const esBlock = sch.alarmPath ? `
          <div class="es-head">
            <div>
              <h4>Plano del circuito del telerruptor KM44.4 (interactivo)</h4>
              <p>Sobre el <strong>plano real</strong>: toca un <strong>componente</strong> o un <strong>cable</strong> y se resalta en naranja todo su recorrido. <span id="esLabel" class="es-label"></span></p>
            </div>
            <div class="es-actions">
              <button class="button button--dark" type="button" onclick="esTrace()">⚡ Lazo de la alarma</button>
              <button class="button button--light" type="button" onclick="esClear()">Quitar resaltado</button>
              <button class="button button--light" id="esToggleBtn" type="button" onclick="es2Toggle('${machine.id}')">Ver esquema simplificado</button>
              <button class="button button--light" type="button" onclick="schViewSheet('${machine.id}','44')">🔍 Hoja 44 a pantalla completa</button>
            </div>
          </div>
          <div class="es-wrap" id="esWrap" data-mode="real">${es2OverlaySvg(machine.id)}</div>
        ` : "";
        return `
          <div class="panel-header-clean">
            <h3>Plano eléctrico — ${sch.maquina}</h3>
            <p>Esquema ${sch.ref} · ${sch.devices.length} componentes · ${sch.sheets.length} hojas.</p>
          </div>
          ${esBlock}
          <div class="panel-header-clean" style="margin-top:18px"><h4>Buscador de componentes (todo el plano)</h4><p>Busca cualquier componente para ver su ficha, hoja y conexiones.</p></div>
          <div class="sch-toolbar">
            <input id="schSearch" placeholder="Buscar: KM44.4, A12.9, fusible, motor…" oninput="schFilter('${machine.id}')" />
            <select id="schGroup" onchange="schFilter('${machine.id}')">
              <option value="">Todos los grupos</option>
              ${sch.groups.map(g => `<option>${g}</option>`).join("")}
            </select>
            <button class="button button--dark" type="button" onclick="schTraceAlarm('${machine.id}')">⚡ Trazar alarma telerruptor</button>
          </div>
          <div class="sch-body">
            <div class="sch-list" id="schList">${schListHtml(machine.id)}</div>
            <div class="sch-detail" id="schDetail">${schDetailHtml(machine.id, sel)}</div>
          </div>
          <div class="panel-header-clean" style="margin-top:20px"><h4>Visor de hojas — todo el plano (${sch.sheets.length} hojas, todas interactivas)</h4><p>Elige una hoja: a la derecha verás sus <strong>componentes y conexiones</strong>. Toca “ir →” en una conexión para saltar a la hoja del componente conectado. Rueda = zoom · arrastra = mover.</p></div>
          <div class="sv-toolbar">
            <select id="svSheet" onchange="schOpenSheet('${machine.id}', this.value)">${schSheetOptions(sch, "44")}</select>
            <button class="button button--light" type="button" onclick="svZoom(1.3)">＋ Zoom</button>
            <button class="button button--light" type="button" onclick="svZoom(0.77)">－</button>
            <button class="button button--light" type="button" onclick="svReset()">Ajustar</button>
            <span id="svTitle" class="sv-title"></span>
          </div>
          <div class="sv-area">
            <div class="sv-stage" id="svStage" onwheel="svWheel(event)" onmousedown="svDown(event)" onmousemove="svMove(event)" onmouseup="svUp()" onmouseleave="svUp()">
              <img id="svImg" class="sv-img" src="${(sch.img && sch.img["44"]) || ""}" draggable="false" alt="Hoja del plano">
            </div>
            <div class="cn-panel" id="cnPanel">${schConnPanel(machine.id, "44")}</div>
          </div>
          <p class="sv-hint">Tip: busca un componente arriba (p. ej. <strong>A29.1</strong>, <strong>M31.1</strong>, <strong>F19.1</strong>) y se abre su hoja con sus conexiones.</p>
          <div class="panel-header-clean" style="margin-top:18px"><h4>Explicación de la conexión</h4><p>Toca un componente (en el panel de la derecha o en el buscador) y aquí se explica en palabras cómo se conecta y qué activa.</p></div>
          <div class="ex-box" id="schExplain">${schExplainHtml(machine.id, sel)}</div>`;
      }

      function schListHtml(mid, query = "", group = "") {
        const sch = schGet(mid);
        const q = normalize(query);
        const sel = schSelected[mid];
        const items = sch.devices.filter(d => {
          const okG = !group || d.g === group;
          const okQ = !q || normalize(`${d.i} ${d.t} ${d.d}`).includes(q);
          return okG && okQ;
        });
        const byG = {};
        items.forEach(d => { (byG[d.g] = byG[d.g] || []).push(d); });
        const out = Object.keys(byG).sort().map(g => `
          <div class="sch-grp"><span>${g}</span><small>${byG[g].length}</small></div>
          ${byG[g].sort((a, b) => a.i.localeCompare(b.i)).map(d => `
            <button class="sch-item ${d.i === sel ? "is-sel" : ""}" type="button" onclick="schSelect('${mid}','${schEsc(d.i)}')">
              <span class="sch-item__id">${d.i}</span>
              <span class="sch-item__d">${d.d || d.t}</span>
              <span class="sch-item__s">h.${d.s}</span>
            </button>`).join("")}
        `).join("");
        return out || '<p style="padding:12px;color:var(--muted)">Sin resultados.</p>';
      }

      function schGraphSvg(mid, id) {
        const sch = schGet(mid);
        const neighbors = (sch.adj[id] || []).slice(0, 10);
        const W = 620, H = 320, cx = W / 2, cy = H / 2;
        const n = neighbors.length;
        let edges = "", nodes = "";
        neighbors.forEach(([w, to], i) => {
          const ang = (2 * Math.PI * i / Math.max(n, 1)) - Math.PI / 2;
          const x = cx + 120 * Math.cos(ang), y = cy + 115 * Math.sin(ang);
          const mx = (cx + x) / 2, my = (cy + y) / 2;
          edges += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="sch-edge"/>`;
          edges += `<text x="${mx}" y="${my - 3}" class="sch-edge-lbl">${w}</text>`;
          const td = schDev(sch, to);
          nodes += `<g class="sch-node" onclick="schSelect('${mid}','${schEsc(to)}')">
            <rect x="${x - 54}" y="${y - 16}" width="108" height="32" rx="8"/>
            <text x="${x}" y="${y - 1}" class="sch-node-id">${to}</text>
            <text x="${x}" y="${y + 11}" class="sch-node-sub">${td ? "h." + td.s : ""}</text>
          </g>`;
        });
        const d = schDev(sch, id);
        const center = `<g class="sch-node sch-node--center">
          <rect x="${cx - 64}" y="${cy - 20}" width="128" height="40" rx="10"/>
          <text x="${cx}" y="${cy - 2}" class="sch-node-id">${id}</text>
          <text x="${cx}" y="${cy + 12}" class="sch-node-sub">${d ? "h." + d.s : ""}</text>
        </g>`;
        return `<svg class="sch-graph" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${edges}${nodes}${center}</svg>`;
      }

      function schDetailHtml(mid, id) {
        const sch = schGet(mid);
        const d = schDev(sch, id);
        if (!d) return "<p>Componente no encontrado.</p>";
        const neighbors = sch.adj[id] || [];
        const sheet = sch.sheets.find(s => s.n === d.s);
        const hasImg = sch.img && sch.img[d.s];
        return `
          <div class="sch-card">
            <div class="sch-card__head">
              <div><span class="sch-card__id">${d.i}</span> <span class="type-badge">${d.t}</span> <span class="system-badge">${d.g}</span></div>
              ${sheet ? `<button class="button button--light" type="button" onclick="schViewSheet('${mid}','${schEsc(d.s)}')">📄 Ver hoja ${d.s}${hasImg ? "" : " (PDF)"}</button>` : ""}
            </div>
            <p class="sch-card__desc">${d.d || ""}</p>
            ${d.p ? `<div class="sch-card__pins"><strong>Pines / hilos:</strong> ${d.p}</div>` : ""}
            ${sheet ? `<p class="sch-card__sheet">Hoja <strong>${d.s}</strong> — ${sheet.t}</p>` : ""}
            <div class="sch-conns">
              <h5>Conexiones (${neighbors.length})</h5>
              ${neighbors.length ? `<table class="crit-table"><tbody>
                <tr><th>Hilo / potencial</th><th>Conecta con</th></tr>
                ${neighbors.map(([w, to]) => {
                  const td = schDev(sch, to);
                  return `<tr><td><code>${w}</code></td><td><button class="sch-link" type="button" onclick="schSelect('${mid}','${schEsc(to)}')">${to}</button> ${td ? `<small>${td.d || td.t}</small>` : ""}</td></tr>`;
                }).join("")}
              </tbody></table>` : '<p style="color:var(--muted)">Sin conexiones punto a punto registradas (puede compartir solo buses de potencia o 24 V).</p>'}
            </div>
          </div>`;
      }

      function schSelect(mid, id) {
        schSelected[mid] = id;
        const det = document.getElementById("schDetail");
        if (det) det.innerHTML = schDetailHtml(mid, id);
        const list = document.getElementById("schList");
        if (list) list.querySelectorAll(".sch-item").forEach(b => b.classList.toggle("is-sel", b.querySelector(".sch-item__id")?.textContent === id));
        det?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        // Abrir la hoja del componente en el visor de todo el plano + enfocarlo en el panel
        const dev = schDev(schGet(mid), id);
        if (dev && dev.s && document.getElementById("svImg")) schOpenSheet(mid, dev.s, id);
        schShowExplain(mid, id);
      }

      function schFilter(mid) {
        const q = document.getElementById("schSearch")?.value || "";
        const g = document.getElementById("schGroup")?.value || "";
        const list = document.getElementById("schList");
        if (list) list.innerHTML = schListHtml(mid, q, g);
      }

      function schTraceAlarm(mid) {
        const sch = schGet(mid);
        schSelect(mid, "KM44.4");
        const det = document.getElementById("schDetail");
        if (det && sch.alarmPath) {
          const ribbon = `<div class="sch-alarm">
            <h5>⚡ Ruta de la alarma “Anomalía telerruptor” (KM44.4)</h5>
            <div class="sch-alarm__flow">${sch.alarmPath.map(seg => `
              <div class="sch-alarm__seg">
                <span class="sch-alarm__node" onclick="schSelect('${mid}','${schEsc(seg.a)}')">${seg.a}<small>${seg.ap}</small></span>
                <span class="sch-alarm__wire">→ ${seg.w}<small>${seg.d}</small></span>
                <span class="sch-alarm__node" onclick="schSelect('${mid}','${schEsc(seg.b)}')">${seg.b}<small>${seg.bp || ""}</small></span>
              </div>`).join("")}</div>
            <p style="font-size:0.85rem;color:var(--muted);margin:8px 0 0">Si el PLC manda (A12.9 OUT11) y no recibe el retorno (A12.4 IN2), salta la alarma. Revisa este lazo de punta a punta.</p>
          </div>`;
          det.insertAdjacentHTML("afterbegin", ribbon);
        }
      }

      function schViewSheet(mid, sheetNo) {
        const sch = schGet(mid);
        const img = sch.img && sch.img[sheetNo];
        const sheet = sch.sheets.find(s => s.n === sheetNo);
        if (img && typeof openLightbox === "function") {
          openLightbox(img, `Hoja ${sheetNo} — ${sheet ? sheet.t : ""}`);
        } else {
          alert(`La imagen de la hoja ${sheetNo} no está incluida en la app. Consúltala en el PDF del esquema ES4220003 (hoja ${sheetNo}).`);
        }
      }

      // ===== Esquema eléctrico interactivo del circuito KM44.4 (símbolos reales + resaltado) =====
      const ES_COMP_NETS = {
        "KM44.4": ["p1","p2","p3","o1","o2","o3","4407","wgnd","4408","w24"],
        "A12.9": ["4407"],
        "A12.4": ["4408"],
        "F19.1": ["o1","o2","o3"],
        "RES": ["o1","o2","o3"]
      };
      const ES_NET_LABEL = { p1:"2L1", p2:"2L2", p3:"2L3", o1:"44L1", o2:"44L2", o3:"44L3", "4407":"4407", "4408":"4408", wgnd:"GND", w24:"24V" };
      function esCompsForNet(n){ return Object.keys(ES_COMP_NETS).filter(c => ES_COMP_NETS[c].includes(n)); }
      function esApply(nets, comps, label){
        const svg = document.getElementById("esSvg") || document.getElementById("es2Svg"); if (!svg) return;
        const ns = new Set(nets), cs = new Set(comps);
        const active = ns.size > 0 || cs.size > 0;
        svg.querySelectorAll("[data-net]").forEach(el => { const on = ns.has(el.getAttribute("data-net")); el.classList.toggle("es-hl", on); el.classList.toggle("es-dim", active && !on); });
        svg.querySelectorAll("[data-comp]").forEach(el => { const on = cs.has(el.getAttribute("data-comp")); el.classList.toggle("es-hl", on); el.classList.toggle("es-dim", active && !on); });
        const lbl = document.getElementById("esLabel"); if (lbl) lbl.textContent = label || "";
      }
      function esHl(kind, name){
        if (kind === "comp"){
          const nets = ES_COMP_NETS[name] || [];
          const comps = new Set([name]);
          nets.forEach(n => esCompsForNet(n).forEach(c => comps.add(c)));
          esApply(nets, [...comps], "Resaltado: " + name + " y todas sus conexiones");
        } else {
          const comps = esCompsForNet(name);
          esApply([name], comps, "Cable " + (ES_NET_LABEL[name] || name) + " · conecta: " + comps.join(", "));
        }
      }
      function esClear(){ esApply([], [], ""); }
      function esTrace(){ esApply(["4407","wgnd","w24","4408"], ["KM44.4","A12.9","A12.4"], "Lazo de la alarma: mando 4407 (A12.9→bobina) + realimentación 4408 (aux→A12.4)"); }

      function esSchematicSvg(){
        const phases = [{x:650,i:1},{x:725,i:2},{x:800,i:3}];
        let power = "";
        phases.forEach(ph => {
          const x = ph.x, i = ph.i;
          power += `<line class="es-wire" data-net="p${i}" data-net2 x1="${x}" y1="60" x2="${x}" y2="150"/>`;
          power += `<g data-comp="KM44.4" onclick="esHl('comp','KM44.4');event.stopPropagation()">`
            + `<line class="es-sym" x1="${x}" y1="150" x2="${x}" y2="159"/>`
            + `<line class="es-sym" x1="${x}" y1="159" x2="${x+15}" y2="187"/>`
            + `<line class="es-sym" x1="${x}" y1="183" x2="${x}" y2="191"/>`
            + `<circle class="es-sym" cx="${x}" cy="159" r="2.6"/></g>`;
          power += `<line class="es-wire" data-net="o${i}" x1="${x}" y1="191" x2="${x}" y2="300"/>`;
          power += `<g data-comp="F19.1" onclick="esHl('comp','F19.1');event.stopPropagation()"><rect class="es-cmp-box" x="${x-9}" y="300" width="18" height="34" rx="2"/><line class="es-sym" x1="${x}" y1="300" x2="${x}" y2="334"/></g>`;
          power += `<line class="es-wire" data-net="o${i}" x1="${x}" y1="334" x2="${x}" y2="416"/>`;
          power += `<polyline class="es-sym" data-comp="RES" onclick="esHl('comp','RES');event.stopPropagation()" points="${x},416 ${x-8},424 ${x+8},432 ${x-8},440 ${x+8},448 ${x},456"/>`;
        });
        return `<svg id="esSvg" class="es-svg" viewBox="0 0 920 540" preserveAspectRatio="xMidYMid meet" onclick="esClear()">
          <!-- POTENCIA -->
          <text class="es-lbl-sm" x="650" y="44">2L1 / 2L2 / 2L3 — trifásica desde hoja 22</text>
          <line class="es-rail" x1="640" y1="60" x2="810" y2="60"/>
          ${power}
          <text class="es-lbl-sm" x="828" y="172">KM44.4</text>
          <text class="es-lbl-sm" x="828" y="186">1-2/3-4/5-6</text>
          <text class="es-lbl-sm" x="828" y="252">44L1/44L2/44L3</text>
          <text class="es-lbl-sm" x="828" y="320">F19.1 / F19A.1 · 10A</text>
          <g data-comp="RES" onclick="esHl('comp','RES');event.stopPropagation()">
            <rect class="es-cmp-box" x="612" y="468" width="236" height="40" rx="6"/>
            <text class="es-lbl" x="730" y="486" text-anchor="middle">Resistencias de planchas (R41.x)</text>
            <text class="es-lbl-sm" x="730" y="500" text-anchor="middle">hojas 19 / 19A / 41 · K19.x control</text>
          </g>

          <!-- CONTROL: bobina -->
          <g data-comp="A12.9" onclick="esHl('comp','A12.9');event.stopPropagation()">
            <rect class="es-cmp-box" x="70" y="70" width="170" height="48" rx="6"/>
            <text class="es-lbl" x="155" y="92" text-anchor="middle">PLC · A12.9 (Beckhoff)</text>
            <text class="es-lbl-sm" x="155" y="108" text-anchor="middle">OUT 11 — manda la bobina</text>
          </g>
          <text class="es-lbl-sm" x="162" y="150">4407</text>
          <line class="es-wire" data-net="4407" x1="155" y1="118" x2="155" y2="250"/>
          <g data-comp="KM44.4" onclick="esHl('comp','KM44.4');event.stopPropagation()">
            <rect class="es-sym" x="130" y="250" width="50" height="58" rx="3"/>
            <text class="es-lbl" x="155" y="276" text-anchor="middle">KM44.4</text>
            <text class="es-lbl-sm" x="155" y="292" text-anchor="middle">bobina A1/A2</text>
            <polyline class="es-sym" points="192,256 192,302"/>
            <polyline class="es-sym" points="192,272 200,280 192,288 192,272"/>
            <line class="es-sym" x1="196" y1="270" x2="196" y2="290"/>
          </g>
          <text class="es-lbl-sm" x="206" y="248">diodo</text>
          <line class="es-wire" data-net="wgnd" x1="155" y1="308" x2="155" y2="500"/>

          <!-- CONTROL: realimentación -->
          <text class="es-lbl-sm" x="360" y="74">+24 V (X06-3, hoja 42)</text>
          <circle class="es-sym" cx="400" cy="84" r="3"/>
          <line class="es-wire" data-net="w24" x1="400" y1="84" x2="400" y2="188"/>
          <g data-comp="KM44.4" onclick="esHl('comp','KM44.4');event.stopPropagation()">
            <line class="es-sym" x1="400" y1="188" x2="400" y2="197"/>
            <line class="es-sym" x1="400" y1="197" x2="415" y2="225"/>
            <line class="es-sym" x1="400" y1="221" x2="400" y2="229"/>
            <circle class="es-sym" cx="400" cy="197" r="2.6"/>
            <text class="es-lbl-sm" x="418" y="212">aux 13-14 (NA)</text>
          </g>
          <text class="es-lbl-sm" x="407" y="270">4408</text>
          <line class="es-wire" data-net="4408" x1="400" y1="229" x2="400" y2="320"/>
          <g data-comp="A12.4" onclick="esHl('comp','A12.4');event.stopPropagation()">
            <rect class="es-cmp-box" x="315" y="320" width="170" height="48" rx="6"/>
            <text class="es-lbl" x="400" y="342" text-anchor="middle">PLC · A12.4 (Beckhoff)</text>
            <text class="es-lbl-sm" x="400" y="358" text-anchor="middle">IN 2 — feedback (resistencias insertadas)</text>
          </g>

          <!-- enlace mecánico bobina -> contactos -->
          <polyline class="es-mech" data-comp="KM44.4" onclick="esHl('comp','KM44.4');event.stopPropagation()" points="180,279 560,279 560,170 638,170"/>
          <text class="es-lbl-sm" x="300" y="273">la bobina cierra los contactos de potencia</text>

          <!-- riel GND -->
          <line class="es-rail" x1="70" y1="500" x2="450" y2="500"/>
          <text class="es-lbl-sm" x="74" y="516">0 V / GND (retorno del mando 24 V)</text>
        </svg>`;
      }

      // ===== Capa interactiva SOBRE el plano real escaneado (hoja 44) =====
      function es2OverlaySvg(mid){
        const sch = schGet(mid);
        const img = (sch.img && sch.img["44"]) || "";
        const nets = {
          p1: "115,186 238,186 238,480", p2: "115,198 260,198 260,480", p3: "115,210 282,210 282,480",
          o1: "238,512 238,723 400,723", o2: "260,512 260,700 400,700", o3: "282,512 282,680 400,680",
          "4407": "530,408 530,552", wgnd: "420,219 530,219 530,365", w24: "420,231 650,231 650,358", "4408": "650,408 650,552"
        };
        const comps = [
          { c: "KM44.4", r: [226,468,74,52] }, { c: "KM44.4", r: [510,360,76,50] }, { c: "KM44.4", r: [630,358,46,52] },
          { c: "A12.9", r: [503,551,84,52] }, { c: "A12.4", r: [626,551,74,52] }
        ];
        const netSvg = Object.entries(nets).map(([k, pts]) => `<polyline class="es2-net" data-net="${k}" points="${pts}" onclick="esHl('net','${k}');event.stopPropagation()"></polyline>`).join("");
        const compSvg = comps.map(o => `<rect class="es2-comp" data-comp="${o.c}" x="${o.r[0]}" y="${o.r[1]}" width="${o.r[2]}" height="${o.r[3]}" rx="4" onclick="esHl('comp','${o.c}');event.stopPropagation()"></rect>`).join("");
        return `<svg id="es2Svg" class="es2-svg" viewBox="0 0 1400 990" preserveAspectRatio="xMidYMid meet" onclick="esClear()">
          <image href="${img}" xlink:href="${img}" x="0" y="0" width="1400" height="990"></image>
          ${netSvg}${compSvg}
        </svg>`;
      }
      function es2Toggle(mid){
        const wrap = document.getElementById("esWrap"); if (!wrap) return;
        const btn = document.getElementById("esToggleBtn");
        const isClean = wrap.getAttribute("data-mode") === "clean";
        if (isClean){ wrap.innerHTML = es2OverlaySvg(mid); wrap.setAttribute("data-mode","real"); if (btn) btn.textContent = "Ver esquema simplificado"; }
        else { wrap.innerHTML = esSchematicSvg(); wrap.setAttribute("data-mode","clean"); if (btn) btn.textContent = "Ver plano real"; }
        esClear();
      }

      // ===== Visor de hojas con zoom/pan (navegar TODO el plano) =====
      const svS = { scale: 1, tx: 0, ty: 0, drag: false, sx: 0, sy: 0 };
      function svApply(){ const im = document.getElementById("svImg"); if (im) im.style.transform = `translate(${svS.tx}px,${svS.ty}px) scale(${svS.scale})`; }
      function svReset(){ svS.scale = 1; svS.tx = 0; svS.ty = 0; svApply(); }
      function svZoom(f){ svS.scale = Math.min(8, Math.max(0.5, svS.scale * f)); svApply(); }
      function svWheel(e){ e.preventDefault(); const st = document.getElementById("svStage"); if (!st) return; const r = st.getBoundingClientRect(); const cx = e.clientX - r.left, cy = e.clientY - r.top; const f = e.deltaY < 0 ? 1.15 : 0.87; const ns = Math.min(8, Math.max(0.5, svS.scale * f)); const k = ns / svS.scale; svS.tx = cx - (cx - svS.tx) * k; svS.ty = cy - (cy - svS.ty) * k; svS.scale = ns; svApply(); }
      function svDown(e){ svS.drag = true; svS.sx = e.clientX - svS.tx; svS.sy = e.clientY - svS.ty; }
      function svMove(e){ if (!svS.drag) return; svS.tx = e.clientX - svS.sx; svS.ty = e.clientY - svS.sy; svApply(); }
      function svUp(){ svS.drag = false; }
      function schSheetOptions(sch, current){
        const byG = {};
        sch.sheets.forEach(s => { (byG[s.g] = byG[s.g] || []).push(s); });
        return Object.keys(byG).sort().map(g => `<optgroup label="${g}">${byG[g].map(s => `<option value="${s.n}" ${s.n === current ? "selected" : ""}>${s.n} — ${(s.t || "").slice(0, 64)}</option>`).join("")}</optgroup>`).join("");
      }
      function schOpenSheet(mid, sheetNo, focus){
        const sch = schGet(mid);
        const img = sch.img && sch.img[sheetNo];
        const sheet = sch.sheets.find(s => s.n === sheetNo);
        const im = document.getElementById("svImg");
        const t = document.getElementById("svTitle");
        const sel = document.getElementById("svSheet");
        if (im && img) { im.src = img; svReset(); }
        if (t) t.textContent = sheet ? `Hoja ${sheetNo} — ${sheet.t}` : (img ? "Hoja " + sheetNo : "Hoja " + sheetNo + " (sin imagen)");
        if (sel && sel.value !== sheetNo) sel.value = sheetNo;
        const cn = document.getElementById("cnPanel"); if (cn) cn.innerHTML = schConnPanel(mid, sheetNo, focus);
        const st = document.getElementById("svStage"); if (st) st.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if (focus) setTimeout(() => { document.querySelector("#cnPanel details.cn-comp[open]")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
      }

      // Panel de conexiones de la hoja actual: hace interactivas TODAS las hojas
      function schConnPanel(mid, sheetNo, focus){
        const sch = schGet(mid);
        const ids = (sch.bySheet && sch.bySheet[sheetNo]) || sch.devices.filter(d => d.s === sheetNo).map(d => d.i);
        const comps = ids.map(i => schDev(sch, i) || { i, t: "componente", d: "", s: sheetNo, g: "" });
        const otherSheets = new Set();
        comps.forEach(d => (sch.adj[d.i] || []).forEach(([w, to]) => { const td = schDev(sch, to); if (td && td.s && td.s !== sheetNo) otherSheets.add(td.s); }));
        const jumps = [...otherSheets].sort().map(s => `<button class="cn-jump" type="button" onclick="schOpenSheet('${mid}','${schEsc(s)}')">→ hoja ${s}</button>`).join("");
        const list = comps.length ? comps.sort((a, b) => a.i.localeCompare(b.i)).map(d => {
          const conns = sch.adj[d.i] || [];
          const rows = conns.length ? conns.map(([w, to]) => {
            const td = schDev(sch, to);
            return `<div class="cn-row"><code>${w}</code> <strong>${to}</strong> ${td ? `<span class="cn-comp__d">${(td.d || td.t).slice(0, 24)} · h.${td.s}</span>` : ""} <button class="cn-go" type="button" onclick="schGoTo('${mid}','${schEsc(to)}')">ir →</button></div>`;
          }).join("") : '<div class="cn-row" style="color:var(--muted)">Sin conexiones punto a punto registradas (puede estar solo en buses).</div>';
          return `<details class="cn-comp" ${d.i === focus ? "open" : ""}><summary onclick="schShowExplain('${mid}','${schEsc(d.i)}')"><span class="cn-comp__id">${d.i}</span> <span class="cn-comp__d">${(d.d || d.t).slice(0, 38)}</span></summary><div class="cn-conns">${rows}</div></details>`;
        }).join("") : '<p style="color:var(--muted);font-size:0.84rem">Esta hoja no tiene componentes en el modelo (mira la imagen).</p>';
        return `<h5>Componentes de la hoja ${sheetNo} (${comps.length})</h5>${jumps ? `<div class="cn-jumps"><span style="font-size:0.74rem;color:var(--muted);font-weight:700;align-self:center">Conecta con:</span>${jumps}</div>` : ""}<div class="cn-list">${list}</div>`;
      }
      function schGoTo(mid, compId){
        const sch = schGet(mid); const dev = schDev(sch, compId);
        schSelected[mid] = compId;
        if (dev && dev.s) schOpenSheet(mid, dev.s, compId);
        const det = document.getElementById("schDetail"); if (det) det.innerHTML = schDetailHtml(mid, compId);
        schShowExplain(mid, compId);
      }

      // ===== Explicación en palabras de las conexiones (auto + detalladas, una por una) =====
      const COMP_EXPLAIN = {
        "KM44.4": `<p><strong>KM44.4</strong> es el contactor que da o quita la corriente a las resistencias de las planchas. Funciona así:</p>
          <ul>
            <li>El <strong>PLC le ordena cerrar</strong>: la salida <strong>A12.9 OUT11</strong> energiza su <strong>bobina</strong> (borne A1) por el hilo <strong>4407</strong>; el otro extremo de la bobina (A2) va a 0 V / GND.</li>
            <li>Al energizarse la bobina, <strong>se cierran sus 3 contactos de potencia</strong> (1-2, 3-4, 5-6): dejan pasar la trifásica <code>2L1/2L2/2L3</code> hacia <code>44L1/44L2/44L3</code> → a las resistencias (hojas 19 / 19A / 41).</li>
            <li>Además tiene un <strong>contacto auxiliar 13-14</strong> que, al cerrar el contactor, manda 24 V por el hilo <strong>4408</strong> a la entrada <strong>A12.4 IN2</strong> del PLC: así el PLC <strong>confirma que cerró</strong> ("resistencias insertadas").</li>
            <li>Si el PLC ordena (OUT11) pero <strong>no recibe la confirmación</strong> (IN2) en el tiempo esperado → salta la <strong>Anomalía telerruptor</strong>.</li>
          </ul>`,
        "A12.9": `<p><strong>A12.9</strong> es el módulo de <strong>salidas</strong> del PLC (Beckhoff EL2809, 16 salidas de 24 V). Cada salida manda 24 V para activar una bobina o relé.</p>
          <ul><li>Su salida <strong>OUT11</strong> (hilo <strong>4407</strong>) energiza la <strong>bobina de KM44.4</strong> → activa las resistencias.</li>
          <li>Otras salidas mandan los relés estáticos de calentamiento <strong>A41.2 / A41.6</strong> (OUT6 / OUT7).</li></ul>`,
        "A12.4": `<p><strong>A12.4</strong> es el módulo de <strong>entradas</strong> del PLC (Beckhoff EL1809, 16 entradas). Lee señales de 24 V que le llegan desde la máquina.</p>
          <ul><li>Su entrada <strong>IN2</strong> (hilo <strong>4408</strong>) lee el contacto auxiliar <strong>13-14 de KM44.4</strong>: así el PLC sabe si el contactor cerró de verdad ("resistencias insertadas").</li></ul>`,
        "F19.1": `<p><strong>F19.1</strong> es un magnetotérmico de <strong>10 A</strong> (Siemens 5SY6) que <strong>protege las resistencias de la plancha derecha</strong>.</p>
          <ul><li>Recibe la trifásica desde <strong>KM44.4</strong> (<code>44L1/44L2</code>) y la entrega a los relés de control <strong>K19.1…K19.5</strong> → resistencias <strong>R41.x</strong>.</li>
          <li>Si hay sobrecarga o cortocircuito en las resistencias, <strong>dispara</strong> y corta esa plancha. (F19A.1 hace lo mismo para la plancha izquierda.)</li></ul>`,
        "A41.2": `<p><strong>A41.2</strong> es un <strong>relé estático</strong> (Omron G3PJ-525B, 25 A) que <strong>modula el calentamiento de la plancha derecha</strong>.</p>
          <ul><li>El PLC (<strong>A12.9 OUT6</strong>) le indica cuándo/cuánto calentar; el relé conmuta rápido la corriente a las resistencias <strong>R41.1.x</strong>. La temperatura se lee con un PT100 en <strong>A12.11</strong>.</li></ul>`,
        "A41.6": `<p><strong>A41.6</strong> es un <strong>relé estático</strong> (Omron G3PJ-525B, 25 A) que <strong>modula el calentamiento de la plancha izquierda</strong> (gemelo de A41.2), mandado por <strong>A12.9 OUT7</strong> sobre las resistencias <strong>R41.6.x</strong>.</p>`,
        "K10.3": `<p><strong>K10.3</strong> es un <strong>relé de seguridad</strong> (Omron G7SA) del circuito de seguridad de la ensobradora (canal 1).</p>
          <ul><li>Lo manda el módulo de seguridad del PLC <strong>A12.28</strong> (SAFETY OUT); su contacto <strong>NC 11-12</strong> realimenta a <strong>A12.5 IN15</strong> para verificar que actuó.</li>
          <li>Trabaja en redundancia con <strong>K10.4</strong> (canal 2): los dos deben coincidir para considerar la seguridad OK.</li></ul>`,
        "K10.4": `<p><strong>K10.4</strong> es el <strong>relé de seguridad del canal 2</strong> (redundante con K10.3, Omron G7SA). Lo manda <strong>A12.28</strong> y su contacto <strong>NC 11-12</strong> realimenta a <strong>A12.5 IN16</strong>.</p>`
      };
      function schExplainHtml(mid, id){
        const sch = schGet(mid);
        const d = schDev(sch, id);
        if (!d) return `<p style="color:var(--muted)">Toca un componente (en el panel o en el buscador) para ver la explicación de sus conexiones.</p>`;
        const head = `<div class="ex-head"><span class="ex-id">${id}</span> <span class="type-badge">${d.t}</span> <span class="system-badge">hoja ${d.s}</span></div>`;
        if (COMP_EXPLAIN[id]) return head + `<span class="ex-tag ex-tag--full">explicación detallada</span>` + COMP_EXPLAIN[id];
        const conns = sch.adj[id] || [];
        const connText = conns.length
          ? "<ul class='ex-conns'>" + conns.map(([w, to]) => { const td = schDev(sch, to); return `<li>Por el <code>${w}</code> se conecta con <strong>${to}</strong>${td ? ` — ${td.d || td.t} (hoja ${td.s})` : ""}.</li>`; }).join("") + "</ul>"
          : "<p style='color:var(--muted)'>No tiene conexiones punto a punto registradas (puede compartir solo buses de potencia o 24 V).</p>";
        return head + `<span class="ex-tag">explicación automática</span>
          <p>${d.d || d.t}.</p>
          ${d.p ? `<p class="ex-pins"><strong>Pines / hilos:</strong> ${d.p}</p>` : ""}
          <p><strong>Conexiones:</strong></p>${connText}
          <p class="ex-note">Esta explicación se genera del modelo. Las detalladas (escritas a mano) se van completando una por una.</p>`;
      }
      function schShowExplain(mid, id){ const e = document.getElementById("schExplain"); if (e) e.innerHTML = schExplainHtml(mid, id); }

      // Un dato técnico que falte se muestra como "Por registrar", nunca como "undefined".