# Fruit-Classification-Computer-Vision
Our project tackles a common issue in automated retail: inaccurate produce identification at self-checkout systems. Mislabeling or mispricing fresh items often leads to revenue loss, slower checkouts, and poor inventory tracking. Motivated by the potential of computer vision to reduce manual input and improve efficiency, we set out to build a model that can identify fruits and vegetables from images.

We used the Fruits 360 Dataset from Kaggle, which contains over 132,000 labeled images across 194 categories. 

Our features consist of 100×100 resized image pixels, and the label is the produce category. These inputs help the model distinguish between visually similar items, such as different types of apples or citrus fruits.

We trained and compared four models:

1. A baseline custom CNN,
2. ResNet18,
3. EfficientNet-B0,
4. DenseNet-121.
5. a web applicatio  showing real use of the model

Our goal is to deliver a high-accuracy model that reduces checkout errors and supports real-time product recognition, ultimately improving customer experience and operational performance in retail environments.
