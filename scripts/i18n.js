(function () {
  // ---------- Elements ----------
  const toggle    = document.getElementById('langToggle');
  const list      = document.getElementById('langList');
  const labelEl   = document.getElementById('langLabel');
  const hiddenInp = document.getElementById('input_language');
  const htmlEl    = document.documentElement;

  // Links used in the consent text (matches your HTML routes)
  const LINKS = {
    en: { terms: "./policies/english-policy.html", privacy: "./privacy/english-privacy.html" },
    es: { terms: "./policies/spanish-policy.html", privacy: "./privacy/spanish-privacy.html" }
  };

  // ================== FULL POLICY HTML (EN) ==================
  const POLICY_HTML_EN = `
<h3>AVIAN DRIVING SCHOOL TERMS OF SERVICE &amp; STUDENT POLICY</h3>
<p><strong>Effective Date:</strong> November 1, 2025<br>
<strong>Location:</strong> Bronx, New York</p>

<p>We are pleased that you have chosen Avian Driving School, Inc. (“Avian,” “we,” “our”) for your driver-training needs. These Terms of Service (“Terms”) govern all driving lessons, packages, road test services, courses, and use of our website (collectively, the “Services”). By enrolling, scheduling, or participating in any Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
<p>Please review these Terms carefully, as they affect your legal rights and obligations.</p>

<h4>1. ELIGIBILITY</h4>
<p>To receive Services, you must be at least 16 years old and possess a valid New York State learner permit or driver’s license. By signing or using our Services, you represent and warrant that you meet these requirements and are legally able to enter into this agreement.</p>

<h4>2. SAFETY, CONDUCT, AND STUDENT RESPONSIBILITIES</h4>
<p>Driving instruction involves inherent risk. For the safety of all parties, students must:</p>
<ul>
  <li>Follow all instructor directions immediately and without argument.</li>
  <li>Remain attentive and refrain from using mobile devices or other distractions.</li>
  <li>Demonstrate respectful, calm, and cooperative behavior.</li>
  <li>Arrive physically and mentally fit to drive (not tired, impaired, medicated, or ill).</li>
  <li>Avoid reckless, aggressive, or unsafe conduct at all times.</li>
</ul>
<p>Prohibited behavior includes excessive speeding, ignoring instructions, deliberate vehicle misuse, threats, disrespect, aggression, and presence of drugs, alcohol, or weapons.</p>
<p>If any unsafe or inappropriate behavior occurs, Avian may immediately terminate the lesson. No refund, credit, or makeup time will be provided. Your safety, our instructor’s safety, and public safety are our highest priorities.</p>

<h4>3. STUDENT HEALTH &amp; FITNESS TO DRIVE</h4>
<p>Students must notify Avian of any medical condition, injury, medication, or impairment that may affect the ability to drive safely. Instructors may refuse or end a lesson if the student appears unwell, impaired, fatigued, or unsafe. Lessons ended for safety reasons are forfeited.</p>

<h4>4. PAYMENTS, VALIDITY, FEES &amp; REFUNDS</h4>
<ul>
  <li>All lessons, packages, deposits, and Services must be paid in full before scheduling.</li>
  <li>Prices follow Avian’s published rates at the time of purchase and may change without notice.</li>
  <li>Credit card and PayPal payments incur a 3.5% processing fee.</li>
  <li>Zelle payments incur no additional fees.</li>
  <li>New York State sales tax applies where required.</li>
</ul>

<p><strong>Validity Period.</strong> All purchases—including lesson packages, deposits, credits, and gift certificates—expire six (6) months from the date of purchase. Expired balances are non-refundable and non-transferable.</p>

<p><strong>Refund Policy.</strong> A full refund will be issued if requested within seven (7) days of purchase, provided that no services have been used or scheduled. Refund requests made after seven (7) days but within thirty (30) days of purchase will be subject to an administrative fee equal to ten percent (10%) of the total cost or ten dollars ($10), whichever is greater, and any services already used, scheduled, or reserved will be deducted at the school’s current single-service rate.</p>

<p>No refunds will be issued after thirty (30) days from the date of purchase under any circumstances. Refunds, when applicable, will be issued to the original form of payment within 7–10 business days after approval. No refunds will be issued for expired services, unused time after expiration, promotional pricing differences, or discounted package adjustments. All purchases and remaining balances are non-transferable.</p>

<p><strong>By purchasing any service, the student agrees to all refund and expiration terms stated herein.</strong></p>

<h4>5. CANCELLATIONS, RESCHEDULING, &amp; LATENESS</h4>
<ul>
  <li>Lessons must be canceled or rescheduled at least 24 hours in advance.</li>
  <li>Same-day cancellations, no-shows, or missed lessons are forfeited in full.</li>
  <li>Students arriving 30+ minutes late forfeit the lesson.</li>
  <li>Students arriving under 30 minutes late lose that time from the session.</li>
</ul>
<p><strong>Pick-Up Policy.</strong> Free pick-up is provided within a 5-minute driving radius. Students outside this radius must book a double lesson (1.5 hours) or come to the school.</p>
<p><strong>Weather Cancellations.</strong> Avian may cancel or reschedule lessons due to unsafe weather. If Avian cancels, the lesson will be rescheduled. Weather-related cancellations do not qualify for refunds.</p>
<p><strong>Mechanical Delays.</strong> If a lesson is shortened due to mechanical issues, it will be rescheduled. No refunds are issued for mechanical interruptions.</p>

<h4>6. EMERGENCIES &amp; PROOF REQUIREMENTS</h4>
<p>Same-day cancellations require verifiable documentation submitted within 48 hours. Avian may verify any document and deny claims deemed insufficient or fraudulent. Avian’s decision is final.</p>

<h4>7. ROAD TEST POLICIES</h4>
<ul>
  <li>A $135 deposit is required to reserve a vehicle for the DMV test.</li>
  <li>Students must bring a valid permit, 5-hour certificate, and corrective lenses if required.</li>
  <li>Invalid or missing documents result in forfeiture.</li>
  <li>Students must report to Avian’s office before the exam; we do not meet directly at the DMV site.</li>
  <li>Additional travel/toll fees may apply for tests outside our area.</li>
</ul>
<p><strong>No Guarantee.</strong> Avian does not guarantee passing the road test. Results depend on the student’s performance and the DMV examiner’s decision.</p>

<h4>8. LESSON &amp; PACKAGE POLICIES</h4>
<ul>
  <li>Standard lessons are 45 minutes unless otherwise noted.</li>
  <li>Lesson time lost due to student lateness is deducted.</li>
  <li>Instructors or vehicles may change based on availability, safety, or operational needs.</li>
  <li>Expired balances cannot be extended or reinstated.</li>
</ul>

<h4>9. IN-CAR RECORDING DEVICES &amp; TELEMETRICS</h4>
<p>Some Avian vehicles are equipped with audio/video recording, GPS tracking, and telematics for safety and training. By participating, students:</p>
<ul>
  <li>Consent to being recorded;</li>
  <li>Waive any expectation of privacy in the vehicle;</li>
  <li>Acknowledge recordings may be used for training, safety review, or legal matters;</li>
  <li>Understand recordings are Avian property and released only as required by law.</li>
</ul>

<h4>10. PERSONAL PROPERTY</h4>
<p>Avian is not responsible for personal items lost, damaged, or left in the vehicle or on school premises.</p>

<h4>11. UNAUTHORIZED USE OF VEHICLES</h4>
<p>Students may operate instructional vehicles only during authorized lessons under instructor supervision. Any misuse or unauthorized driving may result in immediate termination of Services.</p>

<h4>12. LIABILITY, INSURANCE COVERAGE, &amp; DISCLAIMER</h4>
<p>Avian maintains all legally required commercial instructional-vehicle insurance under New York State law. Students are covered as permitted drivers during active instruction.</p>
<p>Students are not responsible for vehicle damage unless caused by reckless, intentional, or unlawful conduct. Avian is not liable for personal losses, emotional distress, lost wages, schedule disruptions, weather delays, or DMV-related issues.</p>

<h4>13. LIMITATION OF LIABILITY</h4>
<p>To the fullest extent permitted by law, Avian’s total liability shall not exceed the total amount paid by the student in the twelve (12) months preceding the claim. Avian is not liable for indirect, incidental, or consequential damages.</p>

<h4>14. INDEMNIFICATION</h4>
<p>Students agree to indemnify and hold harmless Avian Driving School, its owners, instructors, employees, contractors, and affiliates from any claims, damages, losses, or expenses arising out of:</p>
<ul>
  <li>The student’s negligence or misconduct;</li>
  <li>Violation of these Terms;</li>
  <li>Misrepresentation of identity or eligibility;</li>
  <li>Damage or injury caused to third parties during instruction;</li>
  <li>Fraudulent documentation or false statements.</li>
</ul>
<p>This obligation survives the completion of lessons and Services.</p>

<h4>15. CHOICE OF LAW, ARBITRATION &amp; WAIVER OF LAWSUITS</h4>
<p>These Terms are governed exclusively by the laws of the State of New York. Any dispute, claim, or controversy arising out of these Terms or Services shall be resolved through binding arbitration in Bronx County, New York, pursuant to the American Arbitration Association’s Consumer Arbitration Rules.</p>
<p>By agreeing to these Terms, the student voluntarily waives:</p>
<ul>
  <li>The right to sue Avian Driving School in court;</li>
  <li>The right to a jury trial;</li>
  <li>The right to participate in class actions, joint actions, or representative claims.</li>
</ul>
<p>All claims must be pursued individually. Arbitration decisions are final and binding.</p>

<h4>16. SERVICE CHANGES &amp; TERMINATION</h4>
<p>Avian may modify, adjust, or discontinue any Service, pricing, policy, or lesson format at any time. Changes apply only to future purchases.</p>
<p>Avian reserves the right to refuse or terminate Services to any student who violates these Terms, engages in unsafe or disrespectful conduct, falsifies documents, or otherwise poses a risk to instructors, staff, or the public.</p>

<h4>17. USE OF ARTIFICIAL INTELLIGENCE (AI) &amp; DIGITAL SYSTEMS</h4>
<p>Avian may utilize AI-based tools, scheduling software, communication tools, or digital analysis systems to support operations, safety, scheduling consistency, or customer service. Students acknowledge that AI is used only to enhance administrative processes and does not replace human instructional judgment.</p>

<h4>18. DATA PRIVACY &amp; SECURITY</h4>
<p>Avian collects personal information such as name, contact details, permit/license copies, payment history, scheduling data, lesson progress, and road test information. This information may be shared securely with third-party processors such as Stripe, PayPal, Zelle, DaySmart, or other partners for legitimate operational purposes. Student records may be retained for DMV, insurance, tax, or legal compliance. Use of Services constitutes acknowledgment and acceptance of Avian's Privacy Policy located at aviandrivingschool.com.</p>

<h4>19. BEHAVIOR TOWARD STAFF &amp; ZERO-TOLERANCE POLICY</h4>
<p>Avian enforces a strict zero-tolerance policy regarding harassment, threats, verbal abuse, intimidation, discrimination, or aggressive behavior toward instructors, staff, or other students. Any such behavior may result in immediate termination of Services without refund, and—if necessary—law enforcement intervention.</p>

<h4>20. INSTRUCTOR &amp; VEHICLE ASSIGNMENT</h4>
<p>Avian may assign any qualified instructor or instructional vehicle based on availability, safety requirements, scheduling logistics, or operational needs. Instructor or vehicle changes may occur at any time and are not grounds for refunds or credits.</p>

<h4>21. WEATHER, TRAFFIC &amp; OPERATIONAL CONDITIONS</h4>
<p>Lessons may be delayed, shortened, or rescheduled due to weather, traffic, emergencies, instructor availability, or operational issues. Avian will make reasonable efforts to minimize disruptions, but no refunds are issued for unforeseen conditions outside our control.</p>

<h4>22. NO GUARANTEE OF PERFORMANCE OR DRIVING RESULTS</h4>
<p>Avian Driving School provides professional instruction but makes no guarantee that a student will reach a specific skill level within a certain number of lessons, nor guarantees passing the DMV road test. Progress varies by individual ability, effort, consistency, and adherence to instructor guidance.</p>

<h4>23. NON-ASSIGNABILITY</h4>
<p>Credits, packages, deposits, gift certificates, and Services cannot be transferred, sold, gifted, or assigned to other students. All Services are strictly non-transferable.</p>

<h4>24. GOVERNING LAW</h4>
<p>These Terms are governed by the laws of the State of New York. Any dispute not subject to arbitration shall be resolved exclusively in the courts of Bronx County, New York.</p>

<h4>25. SEVERABILITY</h4>
<p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. The invalid portion will be interpreted in a manner consistent with the parties’ original intent.</p>

<h4>26. CONTACT INFORMATION</h4>
<p>Avian Driving School, Inc.<br>
5 E Gun Hill Road<br>
Bronx, New York 10467<br>
Phone: 718-215-4045<br>
Email: info@aviandrivingschool.com<br>
Website: aviandrivingschool.com</p>
`;

  // ================== FULL POLICY HTML (ES) ==================
  const POLICY_HTML_ES = `
<h3>AVIAN DRIVING SCHOOL TÉRMINOS DE SERVICIO Y POLÍTICA DEL ESTUDIANTE</h3>
<p><strong>Fecha de Vigencia:</strong> 1 de noviembre de 2025<br>
<strong>Ubicación:</strong> Bronx, Nueva York</p>

<p>Nos complace que haya elegido Avian Driving School, Inc. (“Avian”, “nosotros”, “nuestro”) para sus necesidades de entrenamiento de manejo. Estos Términos de Servicio (“Términos”) regulan todas las clases de manejo, paquetes, servicios de examen práctico, cursos y el uso de nuestro sitio web (colectivamente, los “Servicios”). Al inscribirse, programar o participar en cualquier Servicio, usted reconoce que ha leído, entendido y acepta cumplir con estos Términos.</p>
<p>Le recomendamos revisar estos Términos cuidadosamente, ya que afectan sus derechos y obligaciones legales.</p>

<h4>1. ELEGIBILIDAD</h4>
<p>Para recibir Servicios, usted debe tener al menos 16 años y poseer un permiso de aprendizaje o licencia de conducir válida del Estado de Nueva York. Al firmar o utilizar nuestros Servicios, usted declara y garantiza que cumple con estos requisitos y que tiene capacidad legal para aceptar este acuerdo.</p>

<h4>2. SEGURIDAD, CONDUCTA Y RESPONSABILIDADES DEL ESTUDIANTE</h4>
<p>La instrucción de manejo conlleva riesgos inherentes. Para la seguridad de todos, los estudiantes deben:</p>
<ul>
  <li>Seguir todas las instrucciones del instructor de manera inmediata y sin discusión.</li>
  <li>Mantenerse atentos y no usar teléfonos móviles ni distracciones durante la lección.</li>
  <li>Mantener una conducta respetuosa, calmada y cooperativa.</li>
  <li>Presentarse física y mentalmente aptos para conducir (no fatigados, afectados, medicados o enfermos).</li>
  <li>Evitar cualquier conducta agresiva, peligrosa o imprudente.</li>
</ul>
<p>El comportamiento prohibido incluye: exceso de velocidad, ignorar instrucciones, mal uso intencional del vehículo, irrespeto, amenazas, agresiones y posesión de drogas, alcohol o armas.</p>
<p>Si ocurre cualquier conducta insegura o inapropiada, Avian podrá terminar la lección inmediatamente sin reembolso. La seguridad del estudiante, del instructor y del público es nuestra máxima prioridad.</p>

<h4>3. SALUD Y APTITUD DEL ESTUDIANTE PARA CONDUCIR</h4>
<p>Los estudiantes deben informar a Avian sobre cualquier condición médica, lesión, medicación o impedimento que pueda afectar su capacidad para conducir de forma segura. Los instructores pueden rechazar o finalizar una lección si el estudiante parece enfermo, afectado, fatigado o inseguro. Las lecciones terminadas por razones de seguridad se consideran perdidas.</p>

<h4>4. PAGOS, VALIDEZ, CARGOS Y REEMBOLSOS</h4>
<ul>
  <li>Todos los servicios deben pagarse en su totalidad antes de programarse.</li>
  <li>Los precios siguen las tarifas publicadas por Avian al momento de la compra y pueden cambiar sin previo aviso.</li>
  <li>Los pagos con tarjeta de crédito y PayPal tienen un cargo de procesamiento del 3.5%.</li>
  <li>Pagos por Zelle no tienen cargos adicionales.</li>
  <li>Se aplican impuestos del Estado de Nueva York cuando corresponda.</li>
</ul>

<p><strong>Periodo de Validez.</strong> Todas las compras—incluyendo paquetes, depósitos, créditos y certificados de regalo—expiran a los seis (6) meses desde la fecha de compra. Los saldos vencidos no son reembolsables ni transferibles.</p>

<p><strong>Política de Reembolsos.</strong> Se otorgará un reembolso completo si se solicita dentro de los siete (7) días posteriores a la compra, siempre que no se hayan utilizado ni programado servicios. Las solicitudes realizadas después de los siete (7) días pero dentro de los treinta (30) días estarán sujetas a un cargo administrativo equivalente al diez por ciento (10%) del costo total o diez dólares ($10), lo que sea mayor, y se descontará cualquier servicio ya utilizado, programado o reservado según la tarifa vigente.</p>

<p>No se emitirán reembolsos después de treinta (30) días desde la fecha de compra bajo ninguna circunstancia. Los reembolsos, cuando correspondan, se emitirán al método de pago original dentro de 7 a 10 días hábiles después de su aprobación. No se otorgarán reembolsos por servicios vencidos, tiempo no utilizado después de la expiración, diferencias de promociones o ajustes de paquetes con descuento. Todas las compras y saldos restantes no son transferibles.</p>

<p><strong>Al realizar una compra, el estudiante acepta todos los términos de reembolso y expiración establecidos en este documento.</strong></p>

<h4>5. CANCELACIONES, REPROGRAMACIONES Y TARDANZAS</h4>
<ul>
  <li>Las clases deben cancelarse o reprogramarse con al menos 24 horas de anticipación.</li>
  <li>Las cancelaciones del mismo día, ausencias o no presentarse resultan en pérdida total de la clase.</li>
  <li>Llegar 30 minutos o más tarde se considera ausencia total.</li>
  <li>Llegar con menos de 30 minutos de retraso reduce el tiempo de la lección.</li>
</ul>
<p><strong>Área de Recogida.</strong> Se ofrece recogida gratuita dentro de un radio de 5 minutos. Estudiantes fuera de esa zona deben reservar una clase doble (1.5 horas) o acudir a la escuela.</p>
<p><strong>Cancelaciones por Clima.</strong> Avian puede cancelar o reprogramar clases debido a condiciones climáticas inseguras. Si Avian cancela, la clase se reprograma. No se emiten reembolsos por clima.</p>
<p><strong>Demoras Mecánicas.</strong> Si una lección se interrumpe por fallas mecánicas, será reprogramada. No se emiten reembolsos por interrupciones mecánicas.</p>

<h4>6. EMERGENCIAS Y PRUEBA DOCUMENTAL</h4>
<p>Las cancelaciones por emergencia requieren prueba verificable dentro de 48 horas. Avian puede verificar cualquier documento y rechazar aquellos fraudulentos o insuficientes. La decisión de Avian es final.</p>

<h4>7. POLÍTICAS DEL EXAMEN PRÁCTICO (ROAD TEST)</h4>
<ul>
  <li>Se requiere un depósito de $135 para reservar un vehículo para el examen práctico del DMV.</li>
  <li>El estudiante debe traer permiso válido, certificado de 5 horas y lentes si son requeridos.</li>
  <li>Falta de documentación válida resulta en pérdida del examen y del depósito.</li>
  <li>Los estudiantes deben presentarse en la oficina de Avian antes del examen; no nos reunimos directamente en el sitio del DMV.</li>
  <li>Pruebas fuera del área pueden requerir cargos adicionales de viaje o peaje.</li>
</ul>
<p><strong>Sin Garantía.</strong> Avian no garantiza que el estudiante apruebe el examen práctico. Los resultados dependen del desempeño del estudiante y del criterio del examinador del DMV.</p>

<h4>8. POLÍTICAS DE LECCIONES Y PAQUETES</h4>
<ul>
  <li>Las lecciones estándar duran 45 minutos salvo que se indique lo contrario.</li>
  <li>El tiempo perdido por tardanza del estudiante se descuenta.</li>
  <li>Los instructores o vehículos pueden cambiar según disponibilidad o necesidades operativas.</li>
  <li>Los saldos vencidos no se extienden ni se reactivan.</li>
</ul>

<h4>9. DISPOSITIVOS DE GRABACIÓN Y TELEMETRÍA</h4>
<p>Algunos vehículos de Avian cuentan con cámaras de audio/video, GPS y telemetría para seguridad y entrenamiento. Al participar, el estudiante:</p>
<ul>
  <li>Acepta ser grabado;</li>
  <li>Renuncia a cualquier expectativa de privacidad dentro del vehículo;</li>
  <li>Reconoce que las grabaciones pueden usarse para capacitación, revisión de seguridad o asuntos legales;</li>
  <li>Entiende que las grabaciones son propiedad de Avian y solo se divulgan cuando la ley lo exige.</li>
</ul>

<h4>10. ARTÍCULOS PERSONALES</h4>
<p>Avian no es responsable por artículos personales perdidos, dañados o dejados en el vehículo o en las instalaciones.</p>

<h4>11. USO NO AUTORIZADO DEL VEHÍCULO</h4>
<p>Los vehículos solo pueden utilizarse para instrucción autorizada bajo supervisión del instructor. Cualquier uso indebido puede resultar en terminación inmediata del Servicio.</p>

<h4>12. RESPONSABILIDAD, COBERTURA DE SEGURO Y EXENCIÓN</h4>
<p>Avian mantiene todo el seguro comercial requerido por el Estado de Nueva York. Los estudiantes están cubiertos como conductores permitidos durante la instrucción activa.</p>
<p>Los estudiantes no son responsables por daños al vehículo a menos que resulten de conducta temeraria, intencional o ilegal. Avian no se responsabiliza por pérdidas personales, angustia emocional, salarios perdidos, retrasos, clima o asuntos relacionados con el DMV.</p>

<h4>13. LIMITACIÓN DE RESPONSABILIDAD</h4>
<p>En la máxima medida permitida por la ley, la responsabilidad total de Avian no excederá el monto total pagado por el estudiante en los doce (12) meses anteriores al reclamo. Avian no es responsable por daños indirectos, incidentales o consecuentes.</p>

<h4>14. INDEMNIZACIÓN</h4>
<p>El estudiante acepta indemnizar y eximir de responsabilidad a Avian, sus propietarios, instructores, empleados y afiliados ante cualquier reclamación relacionada con:</p>
<ul>
  <li>Negligencia del estudiante;</li>
  <li>Violación de estos Términos;</li>
  <li>Documentos falsificados;</li>
  <li>Daños o lesiones causadas a terceros durante la instrucción.</li>
</ul>
<p>Esta obligación continúa incluso después de completar los Servicios.</p>

<h4>15. LEY APLICABLE, ARBITRAJE Y RENUNCIA A DEMANDAS</h4>
<p>Estos Términos se rigen exclusivamente por las leyes del Estado de Nueva York. Cualquier disputa relacionada con estos Términos se resolverá mediante arbitraje vinculante en el condado de Bronx, bajo las Reglas de Arbitraje del Consumidor de la AAA.</p>
<p>Al aceptar estos Términos, el estudiante renuncia a:</p>
<ul>
  <li>Demandar a Avian en la corte;</li>
  <li>Un juicio por jurado;</li>
  <li>Participación en acciones colectivas o conjuntas.</li>
</ul>
<p>Todos los reclamos deben presentarse individualmente. Las decisiones del árbitro son finales.</p>

<h4>16. CAMBIOS DE SERVICIO Y TERMINACIÓN</h4>
<p>Avian puede modificar o descontinuar Servicios, precios o políticas en cualquier momento. Los cambios aplican solo a compras futuras.</p>
<p>Avian puede negar servicios a cualquier estudiante que viole estos Términos, presente conducta insegura, falte el respeto, o represente riesgo para el público o el personal.</p>

<h4>17. USO DE INTELIGENCIA ARTIFICIAL (IA) Y SISTEMAS DIGITALES</h4>
<p>Avian puede utilizar herramientas basadas en IA, sistemas de programación y plataformas digitales para mejorar operaciones y comunicación. Estas herramientas no reemplazan el juicio profesional del instructor.</p>

<h4>18. PRIVACIDAD Y SEGURIDAD DE DATOS</h4>
<p>Avian recopila información personal como nombre, contacto, copia de permiso/licencia, historial de pagos, programación y datos relacionados con el examen práctico.</p>
<p>La información puede compartirse de forma segura con proveedores como Stripe, PayPal, Zelle, DaySmart u otros socios para fines operativos. Los registros pueden conservarse para fines legales, del DMV, fiscales o de seguro.</p>

<h4>19. POLÍTICA DE CERO TOLERANCIA HACIA EL PERSONAL</h4>
<p>Avian mantiene una política estricta de cero tolerancia contra acoso, amenazas, abuso verbal, discriminación o comportamiento agresivo.</p>
<p>Dicho comportamiento puede resultar en terminación inmediata sin reembolso y posible intervención legal.</p>

<h4>20. ASIGNACIÓN DE INSTRUCTORES Y VEHÍCULOS</h4>
<p>Avian puede asignar cualquier instructor o vehículo calificado según disponibilidad, seguridad, logística y necesidades operativas. Los cambios no son motivo de reembolso.</p>

<h4>21. CLIMA, TRÁFICO Y CONDICIONES OPERATIVAS</h4>
<p>Las lecciones pueden retrasarse, acortarse o reprogramarse debido a clima, tráfico, emergencias o disponibilidad del instructor. No se emiten reembolsos por condiciones fuera del control de Avian.</p>

<h4>22. SIN GARANTÍA DE RESULTADOS</h4>
<p>Avian proporciona instrucción profesional pero no garantiza que un estudiante logrará un nivel específico de destreza en un número determinado de lecciones ni garantiza la aprobación del examen práctico.</p>

<h4>23. NO TRANSFERENCIA</h4>
<p>Créditos, paquetes, depósitos y certificados no pueden transferirse, venderse, regalarse ni compartirse entre estudiantes.</p>

<h4>24. LEY APLICABLE</h4>
<p>Estos Términos se rigen por las leyes del Estado de Nueva York. Cualquier disputa no sujeta a arbitraje será resuelta exclusivamente en las cortes del condado de Bronx.</p>

<h4>25. DIVISIBILIDAD</h4>
<p>Si alguna disposición de estos Términos se considera inválida, las disposiciones restantes seguirán en pleno vigor.</p>

<h4>26. INFORMACIÓN DE CONTACTO</h4>
<p>Avian Driving School, Inc.<br>
5 E Gun Hill Road<br>
Bronx, Nueva York 10467<br>
Teléfono: 718-215-4045<br>
Email: info@aviandrivingschool.com<br>
Sitio web: aviandrivingschool.com</p>
`;

  // ---------- Dictionaries (UI strings only; policy HTML injected separately) ----------
  const I18N = {
    en: {
      title: "Avian Driving School Student Registration Form",
      bot: "Don’t fill this out:",
      "form.title": "Registration Form",
      "form.subtitle": "Complete the registration form to finalize your enrollment.",

      "field.firstName": "First Name*",
      "field.lastName":  "Last Name*",
      "field.address1":  "Street Address*",
      "field.address2":  "Address 2",
      "field.city":      "City*",
      "field.state":     "State*",
      "field.zip":       "ZIP*",

      "field.dob":   "Date of Birth*",
      "field.gender":"Gender*",
      "gender.male":"Male",
      "gender.female":"Female",

      "field.permit":"Permit or License Number*",
      "field.restriction":"Restrictions (if any)",
      "restriction.none":"None",
      "restriction.other":"Other (specify)",

      "field.issue":"Issue Date*",
      "field.exp":"Expiration Date*",

      "field.package":"Packages & Services*",
      "pkg.select": "Please select a package",

      // Optgroup labels
      "group.rt": "Road Test Services",
      "group.classD": "Class D — Lessons & Packages",
      "group.highway": "Highway Lessons",
      "group.courses": "Courses & Certificates",
      "group.cdlA_pkgs": "CDL — Class A Packages",
      "group.cdlA_indiv": "CDL — Class A Individual Services",
      "group.cdlB_sb_pkgs": "CDL — Class B School Bus Packages",
      "group.cdlB_sb_indiv": "CDL — Class B School Bus Individual Services",
      "group.cdlB_st_pkgs": "CDL — Class B Straight Truck Packages",
      "group.cdlB_st_indiv": "CDL — Class B Straight Truck Individual Services",

      "pkg.rtCar":  "Road Test Car — $135",
      "pkg.rtAppt": "Road Test Appointment — $30",
      "pkg.single": "Single Driving Lesson — $60",
      "pkg.d0":     "Class D — 5 Lesson Package — $275",
      "pkg.d10":    "Class D — 10 Lesson Package — $550",
      "pkg.d1": "Class D — Package 1 — $299",
      "pkg.d2": "Class D — Package 2 — $399",
      "pkg.d3": "Class D — Package 3 — $649",
      "pkg.d4": "Class D — Package 4 — $899",
      "pkg.d5": "Class D — Package 5 — $1,249",
      "pkg.d6": "Class D — Package 6 — $1,499",
      "pkg.singleHwy": "Single Highway Lesson — $95",
      "pkg.hwy5":      "5 Highway Lesson Package — $450",
      "pkg.hwy10":     "10 Highway Lesson Package — $900",
      "pkg.mv278":  "MV-278 Duplicate — $40",
      "pkg.pre5hr": "5HR Pre-Licensing Course — $69",
      "pkg.def6hr": "6HR Defensive Course — $100",
      "pkg.cdlA1": "Class A — Package 1 — $1,700",
      "pkg.cdlA2": "Class A — Package 2 — $2,250",
      "pkg.cdlA3": "Class A — Package 3 — $2,950",
      "pkg.cdlA4": "Class A — Package 4 — $3,600",
      "pkg.cdlA_lesson1h": "Tractor Trailer 1 Hour Lesson — $140",
      "pkg.cdlA_rental":   "Road Test Vehicle Rental — $370",
      "pkg.cdl_rtAppt":    "Road Test Appointment — $30",
      "pkg.cdlBsb1": "School Bus — Package 1 — $1,155",
      "pkg.cdlBsb2": "School Bus — Package 2 — $1,925",
      "pkg.cdlBsb_lesson1h": "School Bus 1 Hour Lesson — $110",
      "pkg.cdlBsb_rental":   "Road Test Vehicle Rental — $270",
      "pkg.cdlBst1": "Straight Truck — Package 1 — $1,155",
      "pkg.cdlBst2": "Straight Truck — Package 2 — $1,925",
      "pkg.cdlBst_lesson1h": "Straight Truck 1 Hour Lesson — $110",
      "pkg.cdlBst_rental":   "Road Test Vehicle Rental — $270",

      "field.classDate":"5 Hour Class — Choose Date*",
      "field.classTime":"Time Slot*",
      "hint.classTimes":"Classes are held on Tue, Thu (5:00–10:00 PM), and Sat (10:00 AM–3:00 PM).",

      "field.idFront":"Upload a photo of your ID (Front)*",
      "field.idBack":"Upload a photo of your ID (Back)*",
      "field.5hr-certificate":"Upload a photo of your 5 Hour Certificate (if applicable)",

      "policy.box.title":"Terms & Conditions (Please Read Carefully Before Agreeing)",
      "policy.box":"", // content injected below

      "policy.full": 'Read the full Terms of Service (including arbitration and legal terms) <a id="policyFullLink" href="./policies/english-policy.html" target="_blank" rel="noopener">here</a>.',
      "agree.terms": 'I have read and agree to the <a id="termsLink" href="./policies/english-policy.html" target="_blank" rel="noopener">Terms of Service & Student Policies</a>',
      "agree.privacy": 'I agree to the <a id="privacyLink" href="./privacy/english-privacy.html" target="_blank" rel="noopener">Privacy Policy</a>',
      "agree.sixmo": "I understand all purchases are valid for 6 months and unused lessons expire.",

      "sig.label":"Policy Signature:",
      "sig.aria":"Signature field",
      "sig.hint": "Sign here",
      "btn.clear":"Clear Signature",
      "btn.submit":"Submit Registration",

      "ph.firstName": "First name",
      "ph.lastName": "Last name",
      "ph.address1": "Street address",
      "ph.address2": "Apt, suite, etc. (optional)",
      "ph.city": "City",
      "ph.state": "Select…",
      "ph.zip": "#####",
      "ph.permit": "000-000-000",
      "ph.classDate": "Select a date",
      "ph.classTime": "Auto-set from date"
    },

    es: {
      title: "Formulario de Registro de Estudiantes — Avian Driving School",
      bot: "No complete esto:",
      "form.title": "Formulario de Inscripción",
      "form.subtitle": "Complete el formulario para finalizar su inscripción.",
      "field.firstName":"Nombre*",
      "field.lastName":"Apellido*",
      "field.address1":"Dirección*",
      "field.address2":"Dirección 2",
      "field.city":"Ciudad*",
      "field.state":"Estado*",
      "field.zip":"Código postal*",
      "field.dob":"Fecha de nacimiento*",
      "field.gender":"Género*",
      "gender.male":"Masculino",
      "gender.female":"Femenino",
      "field.permit":"Número de permiso o licencia*",
      "field.restriction":"Restricciones (si aplica)",
      "restriction.none":"Ninguna",
      "restriction.other":"Otra (especifique)",
      "field.issue":"Fecha de emisión*",
      "field.exp":"Fecha de vencimiento*",
      "field.package": "Paquetes y Servicios*",
      "pkg.select": "Seleccione un paquete",

      "group.rt": "Servicios de Examen de Manejo",
      "group.classD": "Clase D — Lecciones y Paquetes",
      "group.highway": "Lecciones de Carretera",
      "group.courses": "Cursos y Certificados",
      "group.cdlA_pkgs": "CDL — Paquetes Clase A",
      "group.cdlA_indiv": "CDL — Servicios Individuales Clase A",
      "group.cdlB_sb_pkgs": "CDL — Paquetes Clase B (Autobús Escolar)",
      "group.cdlB_sb_indiv": "CDL — Servicios Individuales Clase B (Autobús Escolar)",
      "group.cdlB_st_pkgs": "CDL — Paquetes Clase B (Camión Rígido)",
      "group.cdlB_st_indiv": "CDL — Servicios Individuales Clase B (Camión Rígido)",

      "pkg.rtCar":  "Vehículo para Examen de Manejo — $135",
      "pkg.rtAppt": "Cita para Examen de Manejo — $30",
      "pkg.single": "Lección de Manejo Individual — $60",
      "pkg.d0":     "Clase D — Paquete de 5 Lecciones — $275",
      "pkg.d10":    "Clase D — Paquete de 10 Lecciones — $550",
      "pkg.d1": "Clase D — Paquete 1 — $299",
      "pkg.d2": "Clase D — Paquete 2 — $399",
      "pkg.d3": "Clase D — Paquete 3 — $649",
      "pkg.d4": "Clase D — Paquete 4 — $899",
      "pkg.d5": "Clase D — Paquete 5 — $1,249",
      "pkg.d6": "Clase D — Paquete 6 — $1,499",
      "pkg.singleHwy": "Lección de Carretera Individual — $95",
      "pkg.hwy5":      "Paquete de 5 Lecciones de Carretera — $450",
      "pkg.hwy10":     "Paquete de 10 Lecciones de Carretera — $900",
      "pkg.mv278":  "Duplicado de MV-278 — $40",
      "pkg.pre5hr": "Curso Prelicencia de 5 Horas — $69",
      "pkg.def6hr": "Curso de Manejo Defensivo de 6 Horas — $100",
      "pkg.cdlA1": "Clase A — Paquete 1 — $1,700",
      "pkg.cdlA2": "Clase A — Paquete 2 — $2,250",
      "pkg.cdlA3": "Clase A — Paquete 3 — $2,950",
      "pkg.cdlA4": "Clase A — Paquete 4 — $3,600",
      "pkg.cdlA_lesson1h": "Lección de Tractocamión de 1 Hora — $140",
      "pkg.cdlA_rental":   "Renta de Vehículo para Examen — $370",
      "pkg.cdl_rtAppt":    "Cita para Examen de Manejo — $30",
      "pkg.cdlBsb1": "Autobús Escolar — Paquete 1 — $1,155",
      "pkg.cdlBsb2": "Autobús Escolar — Paquete 2 — $1,925",
      "pkg.cdlBsb_lesson1h": "Lección de Autobús Escolar de 1 Hora — $110",
      "pkg.cdlBsb_rental":   "Renta de Vehículo para Examen — $270",
      "pkg.cdlBst1": "Camión Rígido — Paquete 1 — $1,155",
      "pkg.cdlBst2": "Camión Rígido — Paquete 2 — $1,925",
      "pkg.cdlBst_lesson1h": "Lección de Camión Rígido de 1 Hora — $110",
      "pkg.cdlBst_rental":   "Renta de Vehículo para Examen — $270",

      "field.classDate":"Seleccione Curso de 5 horas*",
      "field.classTime":"Horario*",
      "hint.classTimes":"Las clases son Mar, Jue (5:00–10:00 PM) y Sáb (10:00 AM–3:00 PM).",

      "field.idFront":"Suba una foto de su ID (Delante)*",
      "field.idBack":"Suba una foto de su ID (Detrás)*",
      "field.5hr-certificate":"Suba una foto de su 5 horas (si aplica)",

      "policy.box.title":"Términos y Condiciones (Por favor lea cuidadosamente antes de aceptar)",
      "policy.box":"", // content injected below

      "policy.full": 'Lea los Términos completos (incluye arbitraje y condiciones legales) <a id="policyFullLink" href="./policies/spanish-policy.html" target="_blank" rel="noopener">aquí</a>.',
      "agree.terms": 'He leído y acepto los <a id="termsLink" href="./policies/spanish-policy.html" target="_blank" rel="noopener">Términos de Servicio y Políticas del Estudiante</a>',
      "agree.privacy": 'Acepto la <a id="privacyLink" href="./privacy/spanish-privacy.html" target="_blank" rel="noopener">Política de Privacidad</a>',
      "agree.sixmo": "Entiendo que todas las compras son válidas por 6 meses y las no usadas expiran.",

      "sig.label":"Firma de políticas:",
      "sig.aria":"Campo de firma",
      "sig.hint": "Firme aquí",
      "btn.clear":"Borrar firma",
      "btn.submit":"Enviar inscripción",

      "ph.firstName":"Nombre",
      "ph.lastName":"Apellido",
      "ph.address1":"Calle y número",
      "ph.address2":"Apto, piso, etc. (opcional)",
      "ph.city":"Ciudad",
      "ph.state":"Seleccione…",
      "ph.zip":"#####",
      "ph.permit":"000-000-000",
      "ph.classDate":"Seleccione una fecha",
      "ph.classTime":"Se completa automáticamente"
    }
  };

  // Month lists for MDY selects
  const MONTHS = {
    en: ["Month","January","February","March","April","May","June","July","August","September","October","November","December"],
    es: ["Mes","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  };

  // ---------- Helpers ----------
  function setLinksForLang(lang) {
    const { terms, privacy } = LINKS[lang] || LINKS.en;
    const t1 = document.getElementById('termsLink');
    const p1 = document.getElementById('privacyLink');
    const full = document.getElementById('policyFullLink');
    if (t1) t1.href = terms;
    if (p1) p1.href = privacy;
    if (full) full.href = terms;
  }

  function applyTexts(lang) {
    const dict = I18N[lang] || I18N.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!dict[key]) return;
      if (el.tagName === 'OPTGROUP') el.label = dict[key];
      else el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      // Inject full policy HTML here, not via external fetch, to avoid style changes.
      if (key === 'policy.box') {
        el.innerHTML = (lang === 'es' ? POLICY_HTML_ES : POLICY_HTML_EN);
      } else if (I18N[lang][key] != null) {
        el.innerHTML = I18N[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.placeholder = dict[key];
    });

    const tKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (tKey && dict[tKey]) document.title = dict[tKey];

    if (labelEl) labelEl.textContent = lang === 'es' ? 'Español' : 'English (US)';

    rebuildMDY(lang);
  }

  // Gate checkbox by scrolling the #policyBox container
  function resetPolicyScroll() {
    const agree = document.getElementById('agreePolicy');
    const box = document.getElementById('policyBox');
    if (!agree || !box) return;

    // disable until scrolled to bottom
    agree.checked = false;
    agree.disabled = true;

    // Remove previous listeners by cloning
    const clone = box.cloneNode(true);
    box.parentNode.replaceChild(clone, box);
    const newBox = document.getElementById('policyBox');

    const onScroll = () => {
      const atBottom = newBox.scrollTop + newBox.clientHeight >= newBox.scrollHeight - 4;
      if (atBottom) {
        agree.disabled = false;
        newBox.removeEventListener('scroll', onScroll);
      }
    };
    newBox.addEventListener('scroll', onScroll);
  }

  // ---- MDY select builders (localized) ----
  function fillRange(sel, start, end, prefix) {
    if (!sel) return;
    sel.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = prefix;
    sel.appendChild(opt);
    for (let v = start; v <= end; v++) {
      const o = document.createElement('option');
      o.value = String(v).padStart(2, '0');
      o.textContent = v;
      sel.appendChild(o);
    }
  }

  function fillMonths(sel, lang) {
    if (!sel) return;
    sel.innerHTML = '';
    const m = MONTHS[lang] || MONTHS.en;
    m.forEach((name, i) => {
      const o = document.createElement('option');
      o.value = i === 0 ? '' : String(i).padStart(2, '0');
      o.textContent = name;
      sel.appendChild(o);
    });
  }

  function composeHidden(prefix, hiddenId) {
    const M = document.getElementById(prefix + 'Month')?.value;
    const D = document.getElementById(prefix + 'Day')?.value;
    const Y = document.getElementById(prefix + 'Year')?.value;
    const hidden = document.getElementById(hiddenId);
    if (!hidden) return;
    hidden.value = (M && D && Y) ? `${Y}-${M}-${D}` : '';
  }

  function attachMDY(prefix, hiddenId, lang, yearStart, yearEnd) {
    const mSel = document.getElementById(prefix + 'Month');
    const dSel = document.getElementById(prefix + 'Day');
    const ySel = document.getElementById(prefix + 'Year');
    if (!mSel || !dSel || !ySel) return;

    fillMonths(mSel, lang);
    fillRange(dSel, 1, 31, lang === 'es' ? 'Día' : 'Day');

    ySel.innerHTML = '';
    const yOpt = document.createElement('option');
    yOpt.value = '';
    yOpt.textContent = (lang === 'es' ? 'Año' : 'Year');
    ySel.appendChild(yOpt);
    for (let y = yearEnd; y >= yearStart; y--) {
      const o = document.createElement('option');
      o.value = String(y);
      o.textContent = y;
      ySel.appendChild(o);
    }
    ['Month', 'Day', 'Year'].forEach(s => {
      const el = document.getElementById(prefix + s);
      if (el) el.addEventListener('change', () => composeHidden(prefix, hiddenId));
    });
  }

  function rebuildMDY(lang) {
    const now = new Date().getFullYear();
    attachMDY('dob', 'dob', lang, now - 100, now);     // DOB: last 100 years
    attachMDY('issue', 'issueDate', lang, now - 25, now + 1);
    attachMDY('exp', 'expDate', lang, now - 1, now + 15);
  }

  // ---------- Language switching ----------
  function setLang(lang) {
    hiddenInp.value = lang;
    htmlEl.lang = lang;

    applyTexts(lang);
    setLinksForLang(lang);
    resetPolicyScroll();

    // reflect selection in the list
    list?.querySelectorAll('li').forEach(li => {
      li.setAttribute('aria-selected', li.dataset.lang === lang ? 'true' : 'false');
    });
  }

  function openList() {
    if (!list) return;
    list.hidden = false;
    toggle?.setAttribute('aria-expanded', 'true');
    (list.querySelector('li[aria-selected="true"]') || list.querySelector('li'))?.focus();
    document.addEventListener('click', outsideClose, { once: true });
  }
  function closeList() {
    if (!list) return;
    list.hidden = true;
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.focus();
  }
  function outsideClose(e) {
    if (!list) return;
    if (!list.contains(e.target) && e.target !== toggle) closeList();
  }

  // ---------- Wire UI ----------
  if (toggle && list) {
    toggle.addEventListener('click', () => (list.hidden ? openList() : closeList()));
    toggle.addEventListener('keydown', e => {
      if (['ArrowDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
    });

    list.addEventListener('click', e => {
      const li = e.target.closest?.('li[data-lang]');
      if (!li) return;
      e.stopPropagation();
      setLang(li.dataset.lang);
      closeList();
    });

    list.addEventListener('focusout', e => {
      const next = e.relatedTarget;
      if (!list.contains(next) && next !== toggle) closeList();
    });

    list.addEventListener('keydown', e => {
      const items = [...list.querySelectorAll('li')];
      const idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (items[idx + 1] || items[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (items[idx - 1] || items[items.length - 1]).focus(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const li = document.activeElement;
        if (li?.dataset?.lang) { setLang(li.dataset.lang); closeList(); }
      } else if (e.key === 'Escape') { e.preventDefault(); closeList(); }
    });
  }

  // Restriction "Other" toggle (safe if absent)
  const restrictionSel = document.getElementById('restriction');
  const restrictionOther = document.getElementById('restrictionOther');
  if (restrictionSel && restrictionOther) {
    restrictionSel.addEventListener('change', () => {
      const isOther = restrictionSel.value === 'other';
      restrictionOther.classList.toggle('is-hidden', !isOther);
      if (!isOther) restrictionOther.value = '';
    });
  }

  // ---------- Init ----------
  const initialLang = (hiddenInp.value || 'en');
  setLang(initialLang);
})();
