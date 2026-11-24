const slides = [
  {
    section: "Punto de partida", title: "Ya tenemos las 85 características",
    intro: "De la práctica 4, un vector por cada audio.",
    steps: [
      ["Los 85 valores son la entrada de la red.", "vector = [f₁, f₂, …, f₈₅]"],
      ["Cada audio lleva su etiqueta del 0 al 9.", "vector → red → dígito"]
    ]
  },
  {
    section: "Datos", title: "Preparar los ejemplos",
    intro: "Antes de entrenar, preparamos los datos.",
    steps: [
      ["Entrenamiento para ajustar pesos. Validación para medir.", "audio_features_train\naudio_features_val"],
      ["Usamos la media y la desviación de entrenamiento en todos los conjuntos.", "x_norm = (x - media_train) / std_train"],
      ["Al final probamos la red con una grabación nueva.", "Entrenar → validar → probar"]
    ]
  },
  {
    section: "Datos", title: "El recorrido de una grabación",
    intro: "Así obtuvimos los vectores de los dígitos grabados.",
    steps: [
      ["El detector de voz localiza el fragmento hablado.", "Grabación → VAD → tramo de voz"],
      ["Extrae_Caracteristicas.m convierte la voz en números.", "Tramo de voz → 85 valores → red → dígito"]
    ]
  },
  {
    section: "PyTorch", title: "Tensores y gradientes",
    intro: "PyTorch opera con tensores y calcula gradientes.",
    steps: [
      ["Cada fila del tensor representa un audio.", "import torch\n\nx.shape  # (n_audios, 85)"],
      ["Podemos multiplicar, sumar o buscar el máximo, en CPU o GPU.", "scores = x @ pesos + sesgo\nclase = scores.argmax(dim=1)"],
      ["Autograd calcula los gradientes. El optimizador ajusta los pesos.", "loss.backward()\noptimizer.step()"]
    ]
  },
  {
    section: "PyTorch", title: "Dataset y DataLoader",
    intro: "Del ejemplo individual al lote.",
    steps: [
      ["P5Dataset hereda de Dataset y guarda los datos en self.", "class P5Dataset(Dataset):\n    def __init__(self, features, labels):\n        self.features = features.astype(np.float32)\n        self.labels = labels"],
      ["__len__ cuenta ejemplos. __getitem__ devuelve el vector y su etiqueta.", "def __len__(self):\n    return len(self.labels)\n\ndef __getitem__(self, idx):\n    return self.features[idx], self.labels[idx]"],
      ["DataLoader agrupa hasta 512 ejemplos y mezcla el orden al entrenar.", "train_dataset = P5Dataset(features_train_norm, labels_train)\ntrain_loader = DataLoader(\n    train_dataset, batch_size=512, shuffle=True\n)"]
    ]
  },
  {
    section: "Modelo", title: "Definir un bloque con nn.Module",
    intro: "Una pieza reutilizable de la red.",
    steps: [
      ["super() inicializa nn.Module para poder registrar las capas.", "class Capa(nn.Module):\n    def __init__(self, input_dim, out_dim):\n        super().__init__()"],
      ["Linear transforma, BatchNorm normaliza y ReLU pone a cero los negativos.", "self.ff = nn.Linear(input_dim, out_dim)\nself.bn = nn.BatchNorm1d(out_dim)\nself.relu = nn.ReLU()"],
      ["En Capa, forward indica en qué orden se aplican las operaciones.", "def forward(self, x):\n    return self.relu(self.bn(self.ff(x)))"]
    ]
  },
  {
    section: "Modelo", title: "Montar la red con nn.Sequential",
    intro: "La salida de una capa entra en la siguiente.",
    steps: [
      ["Con append añadimos un bloque oculto y la capa de salida.", "layers = []\nlayers.append(Capa(85, 4))\nlayers.append(nn.Linear(4, 10))"],
      ["Red hereda de nn.Sequential. Pasamos las capas al padre con *layers.", "class Red(nn.Sequential):\n    def __init__(self):\n        layers = [Capa(85, 4), nn.Linear(4, 10)]\n        super().__init__(*layers)"],
      ["red(x) ejecuta las capas en orden. Sequential ya implementa forward.", "85 características → 4 activaciones → 10 puntuaciones"]
    ]
  },
  {
    section: "Entrenamiento", title: "Qué ocurre en train_epoch",
    intro: "Una época es una pasada por los datos de entrenamiento.",
    steps: [
      ["Por lote, limpiamos gradientes y calculamos la pérdida.", "network.train()\nfor x, y in dataloader:\n    optimizer.zero_grad()\n    scores = network(x)\n    loss = loss_fn(scores, y)"],
      ["backward() calcula los gradientes. step() actualiza los pesos.", "    loss.backward()\n    optimizer.step()"],
      ["Accuracy es la proporción de aciertos.", "prediccion = scores.argmax(dim=1)\naccuracy = aciertos / ejemplos"]
    ]
  },
  {
    section: "Entrenamiento", title: "Validar con eval",
    intro: "Medimos la pérdida y los aciertos en otros datos.",
    steps: [
      ["eval() desactiva Dropout y hace que BatchNorm use las estadísticas acumuladas.", "network.train()  # entrenamiento\nnetwork.eval()   # validación o test"],
      ["Con no_grad() medimos el rendimiento sin calcular gradientes ni actualizar pesos.", "network.eval()\nwith torch.no_grad():\n    for x, y in val_loader:\n        scores = network(x)\n        loss = loss_fn(scores, y)"]
    ]
  },
  {
    section: "Entrenamiento", title: "Qué coordina la función train",
    intro: "El bucle principal está en train_net.py.",
    steps: [
      ["En cada época, primero entrenamos y luego validamos.", "for epoch in range(num_epochs):\n    # Ajustar pesos con train_epoch(...)\n    # Medir con validate_epoch(...)"],
      ["Guardamos las métricas para dibujar las curvas.", "train_losses, val_losses, train_acc, val_acc"]
    ]
  },
  {
    section: "Entrenamiento", title: "La configuración inicial",
    intro: "Estos son los valores de partida de la práctica.",
    steps: [
      ["Cinco épocas, lotes de 512 y una tasa de 0,01.", "learning_rate = 0.01\nbatch_size = 512\nnum_epochs = 5\nred1 = Red(input_dim=85, hidden_dim=[4], p_dropout=0)"],
      ["Adam ajusta los pesos. CrossEntropyLoss mide el error.", "optimizer = optim.Adam(red1.parameters(), lr=learning_rate)\nloss_fn = nn.CrossEntropyLoss()"],
      ["En validación incluimos hasta el último lote incompleto.", "val_loader = DataLoader(\n    valid_dataset, batch_size=512,\n    shuffle=False, drop_last=False\n)"]
    ]
  },
  {
    section: "Resultados", title: "Leer las curvas de aprendizaje",
    intro: "Cada punto corresponde a una época.",
    steps: [
      ["La pérdida baja en entrenamiento y en validación.", "loss"],
      ["Los aciertos suben. Si solo mejora el entrenamiento, puede haber sobreajuste.", "accuracy"]
    ]
  },
  {
    section: "Experimentos", title: "Tasa de aprendizaje y épocas",
    intro: "Dos formas de cambiar cuánto aprende la red.",
    steps: [
      ["La tasa de aprendizaje regula el tamaño de cada ajuste.", "Experimento: cambia learning_rate"],
      ["Más épocas dan más pasadas. Compara tiempo y accuracy.", "Experimento: cambia num_epochs"]
    ]
  },
  {
    section: "Experimentos", title: "Tamaño del lote",
    intro: "Un lote equivale a una actualización de pesos.",
    steps: [
      ["Lotes más pequeños suelen dar más actualizaciones por época.", "1.024 ejemplos / 128 = 8 actualizaciones\n1.024 ejemplos / 512 = 2 actualizaciones"],
      ["Cambia el tamaño del lote y compara tiempo y accuracy.", "Experimento: cambia batch_size"]
    ]
  },
  {
    section: "Experimentos", title: "Cambiar la arquitectura",
    intro: "Probamos redes con más capacidad.",
    steps: [
      ["Más capas dan profundidad. Más neuronas por capa dan anchura.", "Más profunda: 85 → 4 → 4 → 10\nMás ancha:    85 → 16 → 10"],
      ["Revisa si la mejora también aparece en validación.", "Compara loss y accuracy de train y validación"]
    ]
  },
  {
    section: "Experimentos", title: "Regularizar con Dropout",
    intro: "Una forma de reducir el sobreajuste.",
    steps: [
      ["En train(), Dropout pone activaciones a cero al azar.", "nn.Dropout(p=0.2)  # valor de ejemplo"],
      ["En eval(), Dropout está desactivado.", "network.train()  # Dropout activo\nnetwork.eval()   # Dropout inactivo"]
    ]
  },
  {
    section: "Test", title: "Predecir un audio nuevo",
    intro: "Aplicamos el mismo procesamiento del entrenamiento.",
    steps: [
      ["Localizamos la voz y extraemos sus 85 características.", "Audio → detect_speech → extract_features"],
      ["Normalizamos y damos al tensor forma (1, 85) para un único audio.", "x_norm = (descriptor - media_train) / std_train\nx = torch.as_tensor(x_norm, dtype=torch.float32)\nx = x.reshape(1, 85)"],
      ["argmax elige el dígito con la puntuación más alta.", "red.eval()\nwith torch.no_grad():\n    digito = red(x).argmax(dim=1).item()"]
    ]
  }
];
