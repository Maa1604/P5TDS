const slides = [
  {
    section: "Punto de partida", title: "Del audio al dígito",
    intro: "En la práctica 4 ya convertimos cada grabación en un vector de 85 características.",
    steps: [
      ["Cada número describe algo del fragmento de voz. La red recibe esos 85 valores como entrada.", "vector = [f₁, f₂, …, f₈₅]"],
      ["Cada grabación tiene además una etiqueta del 0 al 9. Esa etiqueta es la respuesta que queremos que aprenda la red.", "vector → red → dígito"]
    ]
  },
  {
    section: "Datos", title: "Preparar los ejemplos",
    intro: "Las características ya están extraídas. Ahora preparamos los datos para entrenar, validar y probar.",
    steps: [
      ["El conjunto de entrenamiento sirve para ajustar los pesos. El conjunto de validación sirve para medir cómo va el aprendizaje.", "audio_features_train\naudio_features_val"],
      ["Calculamos la media y la desviación típica de cada característica con los datos de entrenamiento. Usamos esos mismos valores en entrenamiento, validación y test.", "x_norm = (x - media_train) / std_train"],
      ["El objetivo es comparar configuraciones de la red y acabar probándola con un audio nuevo.", "Entrenar → validar → probar"]
    ]
  },
  {
    section: "Datos", title: "El recorrido de una grabación",
    intro: "La base de datos se construyó con vuestras grabaciones de dígitos en castellano.",
    steps: [
      ["El detector de actividad vocal (VAD) localiza el tramo de voz en la señal.", "Grabación → VAD → tramo de voz"],
      ["Extrae_Caracteristicas.m convierte ese tramo en el descriptor que ya tenemos. La red usa el descriptor para elegir entre cero y nueve.", "Tramo de voz → 85 valores → red → dígito"]
    ]
  },
  {
    section: "PyTorch", title: "Tensores y gradientes",
    intro: "PyTorch nos da operaciones sobre datos y control sobre cómo construimos y entrenamos la red.",
    steps: [
      ["Un tensor puede ser un vector, una matriz o tener más dimensiones. Aquí podemos agrupar varios audios en una matriz con 85 columnas.", "import torch\n\nx.shape  # (n_audios, 85)"],
      ["Con tensores podemos multiplicar matrices, sumar valores o encontrar la puntuación más alta. Las operaciones pueden ejecutarse en CPU o GPU según el dispositivo.", "scores = x @ pesos + sesgo\nclase = scores.argmax(dim=1)"],
      ["Autograd registra las operaciones necesarias. Al llamar a backward(), calcula cuánto cambia la pérdida con respecto a cada peso. El optimizador usa esos gradientes para actualizar la red.", "loss.backward()\noptimizer.step()"]
    ]
  },
  {
    section: "PyTorch", title: "Dataset y DataLoader",
    intro: "El Dataset sabe dar un ejemplo. El DataLoader pide varios ejemplos y los agrupa en lotes.",
    steps: [
      ["P5Dataset hereda de Dataset. En __init__ guardamos los vectores y etiquetas en self, comprobamos sus dimensiones y convertimos las características a float32.", "class P5Dataset(Dataset):\n    def __init__(self, features, labels):\n        assert features.shape[1] == 85\n        assert len(features) == len(labels)\n        self.features = features.astype(np.float32)\n        self.labels = labels"],
      ["__len__ dice cuántos ejemplos hay. __getitem__ devuelve el vector y la etiqueta de la posición idx.", "def __len__(self):\n    return len(self.labels)\n\ndef __getitem__(self, idx):\n    return self.features[idx], self.labels[idx]"],
      ["Creamos un Dataset por conjunto. En entrenamiento el DataLoader mezcla el orden con shuffle=True y prepara lotes de hasta 512 ejemplos.", "train_dataset = P5Dataset(features_train_norm, labels_train)\ntrain_loader = DataLoader(\n    train_dataset, batch_size=512, shuffle=True\n)"]
    ]
  },
  {
    section: "Modelo", title: "Definir un bloque con nn.Module",
    intro: "Un bloque agrupa las operaciones que queremos reutilizar dentro de la red.",
    steps: [
      ["Capa hereda de nn.Module. super().__init__() llama al constructor de la clase padre. Lo hacemos primero para que PyTorch pueda registrar las capas que asignamos a self.", "class Capa(nn.Module):\n    def __init__(self, input_dim, out_dim):\n        super().__init__()"],
      ["Linear cambia la dimensión, BatchNorm1d normaliza las activaciones y ReLU pone a cero los valores negativos.", "self.ff = nn.Linear(input_dim, out_dim)\nself.bn = nn.BatchNorm1d(out_dim)\nself.relu = nn.ReLU()"],
      ["En el bloque de la diapositiva, forward define el orden. Se ejecuta cuando llamamos a la capa como capa(x).", "def forward(self, x):\n    return self.relu(self.bn(self.ff(x)))"]
    ]
  },
  {
    section: "Modelo", title: "Montar la red con nn.Sequential",
    intro: "Con nn.Sequential, PyTorch conecta las capas en el orden en que se las damos.",
    steps: [
      ["Vamos añadiendo capas con append. En el ejemplo, la capa oculta pasa de 85 a 4 valores y la salida da una puntuación por cada dígito.", "layers = []\nlayers.append(Capa(85, 4))\nlayers.append(nn.Linear(4, 10))"],
      ["Red hereda de nn.Sequential. super().__init__(*layers) entrega las capas al constructor padre. El asterisco pasa cada capa como un argumento separado.", "class Red(nn.Sequential):\n    def __init__(self):\n        layers = [Capa(85, 4), nn.Linear(4, 10)]\n        super().__init__(*layers)"],
      ["La clase Red ya hereda forward de nn.Sequential. Llamar a red(x) ejecuta toda la cadena. Si definimos Capa también con nn.Sequential, su orden queda definido en el constructor.", "85 características → 4 activaciones → 10 puntuaciones"]
    ]
  },
  {
    section: "Entrenamiento", title: "Qué ocurre en train_epoch",
    intro: "Una época es una pasada por todo el conjunto. Los pesos se actualizan después de cada lote.",
    steps: [
      ["Activamos el modo de entrenamiento. Para cada lote, limpiamos los gradientes anteriores y calculamos las puntuaciones y la pérdida.", "network.train()\nfor x, y in dataloader:\n    optimizer.zero_grad()\n    scores = network(x)\n    loss = loss_fn(scores, y)"],
      ["backward calcula los gradientes de la pérdida. step usa esos gradientes para ajustar los pesos y preparar el modelo para el siguiente lote.", "    loss.backward()\n    optimizer.step()"],
      ["Al terminar la época devolvemos la pérdida media de los lotes y la accuracy, que es la proporción de ejemplos clasificados correctamente.", "prediccion = scores.argmax(dim=1)\naccuracy = aciertos / ejemplos"]
    ]
  },
  {
    section: "Entrenamiento", title: "Validar con eval",
    intro: "validate_epoch recorre el conjunto de validación para obtener la pérdida y la accuracy.",
    steps: [
      ["Con train(), Dropout descarta activaciones al azar y BatchNorm usa estadísticas del lote. Con eval(), Dropout queda inactivo y BatchNorm usa las estadísticas acumuladas.", "network.train()  # entrenamiento\nnetwork.eval()   # validación o test"],
      ["torch.no_grad() desactiva el registro de gradientes durante la validación. Calculamos predicciones y métricas sin llamar a backward ni a optimizer.step().", "network.eval()\nwith torch.no_grad():\n    for x, y in val_loader:\n        scores = network(x)\n        loss = loss_fn(scores, y)"]
    ]
  },
  {
    section: "Entrenamiento", title: "Qué coordina la función train",
    intro: "La función train de train_net.py organiza el entrenamiento completo.",
    steps: [
      ["Por cada época llama primero a train_epoch y después a validate_epoch. Así podemos ver cómo mejora el modelo mientras aprende.", "for epoch in range(num_epochs):\n    # Ajustar pesos con train_epoch(...)\n    # Medir con validate_epoch(...)"],
      ["Guarda las pérdidas y accuracies de ambos conjuntos para dibujar las curvas y registra la mejor accuracy de validación.", "train_losses, val_losses, train_acc, val_acc"]
    ]
  },
  {
    section: "Entrenamiento", title: "La configuración inicial",
    intro: "Elegimos los hiperparámetros antes de llamar a train.",
    steps: [
      ["La práctica parte de una tasa de aprendizaje de 0,01, lotes de 512 y 5 épocas. La red tiene 4 neuronas en su capa oculta y 10 salidas.", "learning_rate = 0.01\nbatch_size = 512\nnum_epochs = 5\nred1 = Red(input_dim=85, hidden_dim=[4], p_dropout=0)"],
      ["Usamos Adam para actualizar los pesos y CrossEntropyLoss para comparar las diez puntuaciones con la etiqueta correcta.", "optimizer = optim.Adam(red1.parameters(), lr=learning_rate)\nloss_fn = nn.CrossEntropyLoss()"],
      ["En validación usamos shuffle=False y drop_last=False para mantener el orden e incluir todos los ejemplos, incluso si el último lote queda incompleto.", "val_loader = DataLoader(\n    valid_dataset, batch_size=512,\n    shuffle=False, drop_last=False\n)"]
    ]
  },
  {
    section: "Resultados", title: "Leer las curvas de aprendizaje",
    intro: "Cada punto muestra una métrica al final de una época.",
    steps: [
      ["En la gráfica de la práctica, la pérdida baja tanto en entrenamiento como en validación a lo largo de las cinco épocas.", "loss"],
      ["La accuracy sube en ambos conjuntos. Si en otro experimento entrenamiento sigue mejorando y validación empeora, puede haber sobreajuste.", "accuracy"]
    ]
  },
  {
    section: "Experimentos", title: "Tasa de aprendizaje y épocas",
    intro: "Comparamos distintas configuraciones midiendo la accuracy final y el tiempo de ejecución.",
    steps: [
      ["La tasa de aprendizaje controla cuánto se ajustan los pesos en cada paso. Subirla puede acelerar el aprendizaje, pero si es demasiado alta, la pérdida puede volverse inestable.", "Experimento: cambia learning_rate"],
      ["Más épocas permiten más pasadas por los datos y aumentan el tiempo de entrenamiento. Mira la validación para saber si esas pasadas ayudan.", "Experimento: cambia num_epochs"]
    ]
  },
  {
    section: "Experimentos", title: "Tamaño del lote",
    intro: "batch_size indica cuántos ejemplos se procesan juntos antes de una actualización.",
    steps: [
      ["Con lotes más pequeños suele haber más actualizaciones por época. Con lotes más grandes hay menos actualizaciones y se necesita más memoria por lote.", "1.024 ejemplos / 128 = 8 actualizaciones\n1.024 ejemplos / 512 = 2 actualizaciones"],
      ["Prueba varios tamaños manteniendo los demás ajustes y compara tiempo de ejecución y accuracy de validación.", "Experimento: cambia batch_size"]
    ]
  },
  {
    section: "Experimentos", title: "Cambiar la arquitectura",
    intro: "Podemos dar más capacidad al modelo aumentando la profundidad o la anchura.",
    steps: [
      ["Una red más profunda tiene más capas ocultas. Una red más ancha tiene más neuronas por capa.", "Más profunda: 85 → 4 → 4 → 10\nMás ancha:    85 → 16 → 10"],
      ["Una red con más capacidad puede aprender patrones más complejos. Compara las curvas para ver si esa mejora también aparece en validación.", "Compara loss y accuracy de train y validación"]
    ]
  },
  {
    section: "Experimentos", title: "Regularizar con Dropout",
    intro: "Si la red se ajusta demasiado a los ejemplos de entrenamiento, podemos añadir Dropout.",
    steps: [
      ["Durante entrenamiento, Dropout pone a cero aleatoriamente una proporción de las activaciones. Eso reduce la dependencia de unas pocas neuronas.", "nn.Dropout(p=0.2)  # valor de ejemplo"],
      ["En eval(), Dropout está desactivado. Comparamos la accuracy de validación con y sin Dropout para ver si ayuda.", "network.train()  # Dropout activo\nnetwork.eval()   # Dropout inactivo"]
    ]
  },
  {
    section: "Test", title: "Predecir un audio nuevo",
    intro: "Grabamos un dígito y aplicamos el mismo procesamiento que usó la red durante el entrenamiento.",
    steps: [
      ["detect_speech localiza la voz. extract_features convierte el fragmento en un vector de 85 características.", "Audio → detect_speech → extract_features"],
      ["Normalizamos con la media y desviación del entrenamiento y damos al tensor forma (1, 85). La primera dimensión indica que hay un único audio.", "x_norm = (descriptor - media_train) / std_train\nx = torch.as_tensor(x_norm, dtype=torch.float32)\nx = x.reshape(1, 85)"],
      ["En modo eval, la red devuelve diez puntuaciones. argmax selecciona el índice de la mayor y ese índice es el dígito predicho.", "red.eval()\nwith torch.no_grad():\n    digito = red(x).argmax(dim=1).item()"]
    ]
  }
];
