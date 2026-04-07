#!/usr/bin/env python3
"""Insert dish frontmatter into all zodiacs-full markdown files."""

import os
import re

DISHES = {
    # BITTER + BOILED
    "bitter-boiled-adzuki": "Adzuki in bitter citrus broth with pickled ginger. Nothing without purpose.",
    "bitter-boiled-black": "Black bean soup with braised endive and a strip of orange peel. Calibrated.",
    "bitter-boiled-butter": "Butter bean stew with wilted bitter greens and a bay leaf. Holds itself together.",
    "bitter-boiled-cannellini": "Cannellini with braised chicory and black pepper. For those who know.",
    "bitter-boiled-chickpea": "Chickpea and bitter lemon broth with turnip greens. Can go anywhere.",
    "bitter-boiled-edamame": "Edamame in bitter citrus dashi. Each element earns its place.",
    "bitter-boiled-fava": "Ful medames with bitter orange zest and cumin. Old and unafraid.",
    "bitter-boiled-green": "Green beans in bitter walnut broth with bay. Always another question.",
    "bitter-boiled-kidney": "Kidney bean and kale minestrone, long-simmered. Shows up. Every time.",
    "bitter-boiled-mung": "Mung bean soup with bitter melon. Precise. A little medicinal.",
    "bitter-boiled-navy": "Navy bean and escarole soup. This way. Not another.",
    "bitter-boiled-pinto": "Pinto bean broth with hand-diced onion and bitter herbs. The small things matter.",

    # BITTER + FERMENTED
    "bitter-fermented-adzuki": "Adzuki with fermented bitter orange and sticky rice. Tastes like remembering.",
    "bitter-fermented-black": "Black bean in doenjang broth with bitter greens. A lot going on underneath.",
    "bitter-fermented-butter": "Butter bean with white miso and radicchio. Takes its time.",
    "bitter-fermented-cannellini": "Cannellini in fermented bitter broth with anchovy. An acquired taste. Worth acquiring.",
    "bitter-fermented-chickpea": "Chickpea with fermented bitter paste and shared flatbread. Better with others.",
    "bitter-fermented-edamame": "Fermented edamame with bitter citrus vinaigrette. Controlled. Consistent.",
    "bitter-fermented-fava": "Fava in miso with bitter herb oil. One answer leads to three more.",
    "bitter-fermented-green": "Green beans in bitter fermented dressing with sesame. Strange. Good.",
    "bitter-fermented-kidney": "Kidney bean with fermented black bean sauce and bitter melon. Goes deep.",
    "bitter-fermented-mung": "Mung with bitter fermented paste and ginger. Knows before it's told.",
    "bitter-fermented-navy": "Navy bean in bitter kombucha broth with thyme. Unusual. Correct.",
    "bitter-fermented-pinto": "Pinto beans with fermented bitter plum and herbs. More composition than recipe.",

    # BITTER + FRIED
    "bitter-fried-adzuki": "Pan-fried adzuki with bitter grapefruit and chili oil. Has a lot to say.",
    "bitter-fried-black": "Black beans stir-fried with bitter greens and garlic. Cuts through.",
    "bitter-fried-butter": "Butter bean fritters with bitter herb crust. Nothing by accident.",
    "bitter-fried-cannellini": "Cannellini pan-fried crisp with radicchio. Knows its own mind.",
    "bitter-fried-chickpea": "Crispy chickpea with bitter orange zest and cumin. Spots the opportunity.",
    "bitter-fried-edamame": "Stir-fried edamame with bitter pepper and sea salt. Made. Moving on.",
    "bitter-fried-fava": "Fava flash-fried with bitter lemon and chili. Doesn't hesitate.",
    "bitter-fried-green": "Green beans in bitter sizzling butter with walnuts. Loud about it.",
    "bitter-fried-kidney": "Kidney beans fried with charred bitter greens. Ready for this.",
    "bitter-fried-mung": "Lightly fried mung cakes with bitter herb dip. Checks twice.",
    "bitter-fried-navy": "Crispy navy beans with bitter chicory. Watching. Noting.",
    "bitter-fried-pinto": "Pan-fried pinto with bitter citrus and a mess of herbs. Rules are suggestions.",

    # BITTER + ROASTED
    "bitter-roasted-adzuki": "Roasted adzuki with cacao nib and cardamom. Finished. Nothing out of place.",
    "bitter-roasted-black": "Black bean and bitter chocolate tart with sea salt. Restrained luxury.",
    "bitter-roasted-butter": "Butter bean roasted with radicchio and good olive oil. Allows itself this.",
    "bitter-roasted-cannellini": "Roasted cannellini with bitter lemon and rosemary. Proper.",
    "bitter-roasted-chickpea": "Roasted chickpea with bitter spice and plenty to share. Come over.",
    "bitter-roasted-edamame": "Roasted edamame with bitter zest and flaky salt. The punchline lands.",
    "bitter-roasted-fava": "Roasted fava with bitter orange crust. First to go there.",
    "bitter-roasted-green": "Green beans roasted hard with bitter almonds. Determined to win.",
    "bitter-roasted-kidney": "Roasted kidney beans with bitter herb crust. Knows what it's worth.",
    "bitter-roasted-mung": "Roasted mung with bitter greens and very little fuss. Doesn't need the attention.",
    "bitter-roasted-navy": "Roasted navy bean with bitter herb. Measured. Nothing to excess.",
    "bitter-roasted-pinto": "Roasted pinto with bitter charred edges and ceremony. Has already been complimented.",

    # SOUR + BOILED
    "sour-boiled-adzuki": "Adzuki with pickled plum broth and ginger. Means it.",
    "sour-boiled-black": "Black bean and lime soup with cilantro. Step. Step. Done.",
    "sour-boiled-butter": "Butter bean broth with lemon and parsley. Exactly what it says.",
    "sour-boiled-cannellini": "Cannellini in sorrel broth, balanced to the milliliter. Precision.",
    "sour-boiled-chickpea": "Chickpea soup with preserved lemon and whatever else. Adapts. Works.",
    "sour-boiled-edamame": "Edamame in citrus dashi. Sensible. Correct.",
    "sour-boiled-fava": "Ful medames with fresh lemon and a point to make. Correct. Obviously.",
    "sour-boiled-green": "Green bean and lemon broth with too many herbs. Couldn't sit still.",
    "sour-boiled-kidney": "Kidney bean chili with tangy tomato base. There every time.",
    "sour-boiled-mung": "Mung dal with tamarind. No favorites.",
    "sour-boiled-navy": "Navy bean and lemon broth. A soup. A real one.",
    "sour-boiled-pinto": "Pinto bean and vinegar broth. Yes, that's the whole dish.",

    # SOUR + FERMENTED
    "sour-fermented-adzuki": "Adzuki with fermented plum vinegar and sesame. Exactly what it claims to be.",
    "sour-fermented-black": "Fermented black bean with lime and epazote. Sees past the obvious.",
    "sour-fermented-butter": "Butter bean with kimchi brine. That's enough.",
    "sour-fermented-cannellini": "Cannellini in tangy fermented whey with lemon zest. Has notes.",
    "sour-fermented-chickpea": "Chickpea with lacto-fermented lemon and dill. Smarter than it appears.",
    "sour-fermented-edamame": "Edamame in sour fermented citrus sauce. Show the evidence.",
    "sour-fermented-fava": "Fava in sour fermented brine with mint. Taking the other position, as always.",
    "sour-fermented-green": "Green beans in sour fermented miso dressing with something unexpected. Works somehow.",
    "sour-fermented-kidney": "Kidney bean in fermented tomato brine. There was a reason.",
    "sour-fermented-mung": "Mung with fermented rice water and lime. Wonders if it's enough.",
    "sour-fermented-navy": "Navy bean in bitter-sour brine with onion. Low expectations. Real flavor.",
    "sour-fermented-pinto": "Pinto in tangy fermented sauce. Bracing for it anyway.",

    # SOUR + FRIED
    "sour-fried-adzuki": "Pan-fried adzuki with rice vinegar and scallion. No ambiguity.",
    "sour-fried-black": "Black beans stir-fried with lime and chili. Here it is.",
    "sour-fried-butter": "Butter bean fritters with sharp lemon dip. Gets it done.",
    "sour-fried-cannellini": "Cannellini sautéed with capers and exact lemon zest. Counted.",
    "sour-fried-chickpea": "Chickpea with sumac crust and tangy yogurt. Knows the angles.",
    "sour-fried-edamame": "Edamame fried with vinegar and salt. That's it.",
    "sour-fried-fava": "Fava fried fast in sour pomegranate molasses. No plan. Works anyway.",
    "sour-fried-green": "Green beans quick-fried with vinegar and garlic. Decided. Done.",
    "sour-fried-kidney": "Kidney bean patties with acidic tomato sauce. Not done discussing this.",
    "sour-fried-mung": "Mung cakes with sour dipping sauce. Nothing special, really.",
    "sour-fried-navy": "Navy beans fried with lemon, largely unappreciated. Fine.",
    "sour-fried-pinto": "Pinto fried with citrus and strategic presentation. You didn't notice.",

    # SOUR + ROASTED
    "sour-roasted-adzuki": "Roasted adzuki with rice vinegar glaze. What you see.",
    "sour-roasted-black": "Black bean roasted with lime and oregano. Tries. Means it.",
    "sour-roasted-butter": "Roasted butter bean with preserved lemon. Open. Honest.",
    "sour-roasted-cannellini": "Cannellini roasted with lemon and measured restraint. Chose not to say more.",
    "sour-roasted-chickpea": "Roasted chickpea with pomegranate and za'atar. Ready to be convinced.",
    "sour-roasted-edamame": "Roasted edamame with citric acid and sea salt. Stated plainly.",
    "sour-roasted-fava": "Roasted fava with lemon and fresh herbs. The real thing.",
    "sour-roasted-green": "Green beans roasted with bright lemon. Happy about it.",
    "sour-roasted-kidney": "Roasted kidney beans with balanced citrus and spice. Everyone gets the same.",
    "sour-roasted-mung": "Roasted mung with light tamarind glaze. Feels the edges of things.",
    "sour-roasted-navy": "Roasted navy bean with lemon and quiet confidence. Doesn't announce.",
    "sour-roasted-pinto": "Roasted pinto with citrus oil. Not particularly for you.",

    # SPICY + BOILED
    "spicy-boiled-adzuki": "Adzuki in chili broth with star anise. Ready for whatever comes.",
    "spicy-boiled-black": "Black bean soup with árbol chili. Doesn't stop.",
    "spicy-boiled-butter": "Butter bean stew with chili flakes. Holds. Steady.",
    "spicy-boiled-cannellini": "Cannellini in precisely spiced broth. Every variable controlled.",
    "spicy-boiled-chickpea": "Chickpea curry with green chili and whatever's available. Makes it work.",
    "spicy-boiled-edamame": "Edamame in spiced dashi. Always earning it.",
    "spicy-boiled-fava": "Ful medames with harissa. Won't move.",
    "spicy-boiled-green": "Green bean stew with chili and full conviction. No such thing as too much.",
    "spicy-boiled-kidney": "Kidney bean chili. Same way every time. Because it's right.",
    "spicy-boiled-mung": "Mung bean soup with chili and several rechecks. Just making sure.",
    "spicy-boiled-navy": "Navy bean soup with dried chili. Takes a while to open up.",
    "spicy-boiled-pinto": "Pinto bean stew with varying heat. Depends on the day.",

    # SPICY + FERMENTED
    "spicy-fermented-adzuki": "Adzuki with fermented chili paste. Designed to start something.",
    "spicy-fermented-black": "Black bean in gochujang broth. Something in there. Can't quite place it.",
    "spicy-fermented-butter": "Butter bean with fermented chili and unusual spices. Doesn't explain.",
    "spicy-fermented-cannellini": "Cannellini with fermented pepper sauce, very specific measurements. Specific.",
    "spicy-fermented-chickpea": "Chickpea in spicy fermented paste on flatbread. Shouldn't work. Does.",
    "spicy-fermented-edamame": "Edamame in fermented chili brine. Keeps working.",
    "spicy-fermented-fava": "Fava with fermented harissa. Quietly undermining the expected.",
    "spicy-fermented-green": "Green beans in spicy fermented sauce with seaweed. Against the grain.",
    "spicy-fermented-kidney": "Kidney beans in fermented chili sauce, refined over iterations. Many iterations.",
    "spicy-fermented-mung": "Mung with gochujang ferment. Repeated. Refined. Repeated.",
    "spicy-fermented-navy": "Navy bean with fermented chili. Doesn't need your input.",
    "spicy-fermented-pinto": "Pinto in fermented chili that changes every time. It just does.",

    # SPICY + FRIED
    "spicy-fried-adzuki": "Pan-fried adzuki with chili crisp. Cannot be contained.",
    "spicy-fried-black": "Black beans stir-fried with two chilies. Still going.",
    "spicy-fried-butter": "Butter bean fritters with spiced crust. High wattage.",
    "spicy-fried-cannellini": "Crispy cannellini with chili oil. Going places.",
    "spicy-fried-chickpea": "Chickpea pakora. Decided on the spot. Always perfect.",
    "spicy-fried-edamame": "Edamame stir-fried with chili and black bean paste. Not shy about it.",
    "spicy-fried-fava": "Fava fritters with harissa. No fallback. Doesn't need one.",
    "spicy-fried-green": "Green beans fried hard with chili. Not interested in your feedback.",
    "spicy-fried-kidney": "Kidney bean hash with chili, heat varying by mood. It varies.",
    "spicy-fried-mung": "Spiced mung cakes with chili sauce. Wound tight. Worth it.",
    "spicy-fried-navy": "Crispy navy beans with measured chili blend. System. Process. Result.",
    "spicy-fried-pinto": "Pinto stir-fry with everything spicy and no plan. Glorious.",

    # SPICY + ROASTED
    "spicy-roasted-adzuki": "Roasted adzuki with chili and maple. Fully committed.",
    "spicy-roasted-black": "Black bean and chipotle dip, oven-roasted. Draws everyone over.",
    "spicy-roasted-butter": "Butter bean roasted with harissa and cream. Unapologetically indulgent.",
    "spicy-roasted-cannellini": "Roasted cannellini with chili oil and fresh herbs. Takes over the room.",
    "spicy-roasted-chickpea": "Roasted chickpea with berbere, meant to share. Pull up a chair.",
    "spicy-roasted-edamame": "Roasted edamame with chili salt. Knows exactly what it is.",
    "spicy-roasted-fava": "Roasted fava with baharat and lime. Went somewhere new.",
    "spicy-roasted-green": "Green beans roasted with chili flakes. Looking on the bright side.",
    "spicy-roasted-kidney": "Roasted kidney beans with chipotle and smoked paprika. Feels things deeply.",
    "spicy-roasted-mung": "Roasted mung with chili and date molasses. Stays close.",
    "spicy-roasted-navy": "Roasted navy bean with chili oil. Needs nothing from you.",
    "spicy-roasted-pinto": "Roasted pinto with a rotating chili blend. Different every time.",

    # SWEET + BOILED
    "sweet-boiled-adzuki": "Sweet adzuki soup with mochi. Uncomplicated happiness.",
    "sweet-boiled-black": "Black bean stew with panela and cinnamon. There. Always there.",
    "sweet-boiled-butter": "Butter bean mash with honey-roasted carrots on the side. Everything warm, everything fine.",
    "sweet-boiled-cannellini": "Cannellini in sweet herb broth with good bread. Just for you.",
    "sweet-boiled-chickpea": "Chickpea with honey and warm spice. Goes along. Fits in.",
    "sweet-boiled-edamame": "Sweet edamame with a touch of mirin. Consistent. There when you need it.",
    "sweet-boiled-fava": "Sweet fava stew with carrot and herbs. Keeps going.",
    "sweet-boiled-green": "Green beans with honey butter and fresh dill. Fun.",
    "sweet-boiled-kidney": "Sweet kidney bean stew with coconut and ginger. Here for you.",
    "sweet-boiled-mung": "Sweet mung bean soup with coconut milk. Wants you to feel better.",
    "sweet-boiled-navy": "Sweet baked navy beans with molasses. Making a little go far.",
    "sweet-boiled-pinto": "Pinto in sweet ancho broth. Distracted. Somewhere else entirely.",

    # SWEET + FERMENTED
    "sweet-fermented-adzuki": "Fermented sweet adzuki with rose water and rice. Keeps the old things.",
    "sweet-fermented-black": "Black bean with sweet miso and dark honey. Sits with things.",
    "sweet-fermented-butter": "Butter bean with sweet fermented paste. No rush. It'll be fine.",
    "sweet-fermented-cannellini": "Cannellini in sweet fermented broth with herbs. Everyone leaves satisfied.",
    "sweet-fermented-chickpea": "Chickpea with sweet fermented lemon. Meets you where you are.",
    "sweet-fermented-edamame": "Edamame in sweet fermented sauce, measured precisely. Stage by stage.",
    "sweet-fermented-fava": "Fava with sweet fermented paste and long spices. Sees ten steps ahead.",
    "sweet-fermented-green": "Green beans in sweet fermented miso dressing with something extra. Why not?",
    "sweet-fermented-kidney": "Sweet kidney bean with fermented tamarind. Understands. Really does.",
    "sweet-fermented-mung": "Mung with sweet fermented rice and cardamom. Soft. Careful.",
    "sweet-fermented-navy": "Sweet fermented navy bean soup, made alone, enjoyed quietly. That's enough.",
    "sweet-fermented-pinto": "Pinto in sweet fermented sauce, checked and rechecked. Probably fine.",

    # SWEET + FRIED
    "sweet-fried-adzuki": "Pan-fried sweet adzuki with cane sugar and orange zest. Celebrating.",
    "sweet-fried-black": "Black beans fried with sweet plantain. Somewhere to be.",
    "sweet-fried-butter": "Butter bean fritters with honey drizzle. Sure, why not.",
    "sweet-fried-cannellini": "Cannellini in sweet crispy batter with fresh herbs. Says so.",
    "sweet-fried-chickpea": "Chickpea fritters with sweet yogurt dip. Has everyone laughing.",
    "sweet-fried-edamame": "Edamame fried with mirin glaze. Gets up. Gets moving.",
    "sweet-fried-fava": "Fava in sweet chili batter. Goes for it.",
    "sweet-fried-green": "Green beans fried with honey and sesame. Can't quite settle.",
    "sweet-fried-kidney": "Sweet kidney bean fritters with gentle spice. Watching over.",
    "sweet-fried-mung": "Sweet mung pancakes with elaborate garnish. Takes longer than it should.",
    "sweet-fried-navy": "Sweet fried navy beans with cinnamon sugar. Means it.",
    "sweet-fried-pinto": "Pinto fried with honey and whatever else was nearby. Started three things.",

    # SWEET + ROASTED
    "sweet-roasted-adzuki": "Roasted sweet adzuki with dates and sesame. Takes the best portion and gives it away.",
    "sweet-roasted-black": "Black bean roasted with brown sugar and chipotle. Comes back.",
    "sweet-roasted-butter": "Butter bean roasted with maple and thyme. Not a care in the world.",
    "sweet-roasted-cannellini": "Roasted cannellini with honey and herbs. Puts wind in your sails.",
    "sweet-roasted-chickpea": "Roasted chickpea with sweet spice, plenty for everyone. There's more.",
    "sweet-roasted-edamame": "Roasted edamame with sweet soy glaze. Earns it.",
    "sweet-roasted-fava": "Roasted fava with sweet harissa. Speaks before thinking. Worth hearing.",
    "sweet-roasted-green": "Green beans roasted with varying sweetness. Changes its mind.",
    "sweet-roasted-kidney": "Roasted kidney beans with sweet tomato and herbs. Won't let go.",
    "sweet-roasted-mung": "Roasted mung with light sweet glaze. Fine. All fine.",
    "sweet-roasted-navy": "Sweet roasted navy bean with brown sugar. Keeps to itself. Warm inside.",
    "sweet-roasted-pinto": "Roasted pinto with sweet spice and a hidden kick. Got you.",

    # UMAMI + BOILED
    "umami-boiled-adzuki": "Adzuki in mushroom dashi. Warm. Close. For you.",
    "umami-boiled-black": "Black bean and mushroom soup, long-simmered. Waits as long as needed.",
    "umami-boiled-butter": "Butter bean and leek stew with parmesan rind. Solid. Real.",
    "umami-boiled-cannellini": "Cannellini in careful mushroom broth. Did the right thing.",
    "umami-boiled-chickpea": "Chickpea in miso broth with kombu. Works in any direction.",
    "umami-boiled-edamame": "Edamame in umami dashi with bonito. Committed.",
    "umami-boiled-fava": "Fava and mushroom soup with deep broth. Watching. Ready.",
    "umami-boiled-green": "Green beans in umami broth with shiitake and more shiitake. Produces.",
    "umami-boiled-kidney": "Kidney bean stew with soy and mushroom. No shortcuts.",
    "umami-boiled-mung": "Mung dal with umami depth and no announcement. Just there.",
    "umami-boiled-navy": "Navy bean and mushroom soup, technically correct in every way. Every way.",
    "umami-boiled-pinto": "Pinto in gentle mushroom broth. Approaches carefully.",

    # UMAMI + FERMENTED
    "umami-fermented-adzuki": "Adzuki with aged miso. What does flavor mean? This.",
    "umami-fermented-black": "Black bean in deep fermented miso. Looking inward.",
    "umami-fermented-butter": "Butter bean with white miso and nori. Sits with it.",
    "umami-fermented-cannellini": "Cannellini in fermented umami broth. The world as it should be.",
    "umami-fermented-chickpea": "Chickpea with fermented black garlic and miso. Hasn't been done. Now it has.",
    "umami-fermented-edamame": "Edamame in complex fermented sauce. Noticing everything.",
    "umami-fermented-fava": "Fava with aggressive fermented umami. Against expectations. On purpose.",
    "umami-fermented-green": "Green beans in fermented umami with unexpected combinations. Works somehow.",
    "umami-fermented-kidney": "Kidney bean in miso with competing umami notes. Pulls in two directions.",
    "umami-fermented-mung": "Mung in deep fermented broth with tofu. Almost says something.",
    "umami-fermented-navy": "Navy bean with precisely layered fermented umami. Counts everything.",
    "umami-fermented-pinto": "Pinto in fermented umami sauce. It's fine. Doesn't matter.",

    # UMAMI + FRIED
    "umami-fried-adzuki": "Pan-fried adzuki with soy glaze and scallion. All of it. All of it.",
    "umami-fried-black": "Black beans stir-fried in oyster sauce. One thing, done completely.",
    "umami-fried-butter": "Butter bean patties with soy and mushroom. It works.",
    "umami-fried-cannellini": "Cannellini sautéed in anchovy butter. Stands for something.",
    "umami-fried-chickpea": "Chickpea fried with fish sauce and garlic. Didn't wait to be asked.",
    "umami-fried-edamame": "Edamame stir-fried with umami sauce. On it.",
    "umami-fried-fava": "Fava fried with doubanjiang and soy. Goes straight at you.",
    "umami-fried-green": "Green beans stir-fried with oyster sauce. Already doing more.",
    "umami-fried-kidney": "Kidney bean fried with miso. Has principles. Will tell you.",
    "umami-fried-mung": "Mung fried with soy and black sesame. Not a joke.",
    "umami-fried-navy": "Crispy navy beans with dashi glaze. Better than you expected.",
    "umami-fried-pinto": "Pinto stir-fried with umami sauce. Usually great. Sometimes not there.",

    # UMAMI + ROASTED
    "umami-roasted-adzuki": "Roasted adzuki with miso glaze and sesame. Come in. Sit down.",
    "umami-roasted-black": "Black bean roasted with soy and thyme. Sees what others miss.",
    "umami-roasted-butter": "Butter bean roasted in anchovy oil. Open. Absorbs everything.",
    "umami-roasted-cannellini": "Roasted cannellini with parmesan and herbs. Shares without being asked.",
    "umami-roasted-chickpea": "Roasted chickpea with miso and willingness to hear all of it. Go on.",
    "umami-roasted-edamame": "Roasted edamame with umami salt. Listening. Noticing.",
    "umami-roasted-fava": "Roasted fava with strong miso. On its own terms.",
    "umami-roasted-green": "Green beans roasted with bonito flakes. What's that about? Worth finding out.",
    "umami-roasted-kidney": "Roasted kidney beans with truffle oil and mushroom. Spares nothing.",
    "umami-roasted-mung": "Roasted mung with miso and dark sesame. Beautiful. Sad somehow.",
    "umami-roasted-navy": "Roasted navy bean with soy and herbs. Remembers something. Not sure what.",
    "umami-roasted-pinto": "Roasted pinto with umami glaze. Observing from a distance. Interesting.",
}

ZODIACS_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "zodiacs-full")

updated = 0
skipped = 0
missing = 0

for filename in sorted(os.listdir(ZODIACS_DIR)):
    if not filename.endswith(".md") or filename.startswith("_"):
        continue

    slug = filename[:-3]  # strip .md
    filepath = os.path.join(ZODIACS_DIR, filename)

    with open(filepath, "r") as f:
        content = f.read()

    # Skip if dish already present
    if "dish:" in content:
        skipped += 1
        continue

    if slug not in DISHES:
        print(f"WARNING: No dish for {slug}")
        missing += 1
        continue

    dish = DISHES[slug]

    # Insert after the trait: line
    new_content = re.sub(
        r"(^trait: .+$)",
        r"\1\ndish: " + dish,
        content,
        count=1,
        flags=re.MULTILINE,
    )

    if new_content == content:
        print(f"WARNING: Could not insert dish for {slug}")
        missing += 1
        continue

    with open(filepath, "w") as f:
        f.write(new_content)

    updated += 1

print(f"\nDone. Updated: {updated}, Skipped (already had dish): {skipped}, Missing: {missing}")
