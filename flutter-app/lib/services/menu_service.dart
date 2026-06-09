import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/menu_item.dart';

class MenuService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Stream semua menu yang available
  Stream<List<MenuItem>> menuStream() {
    return _db
        .collection('menu')
        .where('isAvailable', isEqualTo: true)
        .snapshots()
        .map((snap) => snap.docs.map(MenuItem.fromFirestore).toList());
  }

  // Stream menu by category
  Stream<List<MenuItem>> menuByCategory(String category) {
    return _db
        .collection('menu')
        .where('category', isEqualTo: category)
        .where('isAvailable', isEqualTo: true)
        .snapshots()
        .map((snap) => snap.docs.map(MenuItem.fromFirestore).toList());
  }

  // Stream menu featured
  Stream<List<MenuItem>> featuredMenu() {
    return _db
        .collection('menu')
        .where('isFeatured', isEqualTo: true)
        .where('isAvailable', isEqualTo: true)
        .limit(6)
        .snapshots()
        .map((snap) => snap.docs.map(MenuItem.fromFirestore).toList());
  }

  // Get all categories
  Future<List<String>> getCategories() async {
    final snap = await _db
        .collection('menu')
        .where('isAvailable', isEqualTo: true)
        .get();
    final cats = snap.docs
        .map((d) => (d.data()['category'] as String?) ?? '')
        .where((c) => c.isNotEmpty)
        .toSet()
        .toList();
    cats.sort();
    return cats;
  }

  // Get single menu item
  Future<MenuItem?> getMenuItem(String id) async {
    final doc = await _db.collection('menu').doc(id).get();
    if (!doc.exists) return null;
    return MenuItem.fromFirestore(doc);
  }

  // Search menu
  Future<List<MenuItem>> searchMenu(String query) async {
    final snap = await _db
        .collection('menu')
        .where('isAvailable', isEqualTo: true)
        .get();
    final q = query.toLowerCase();
    return snap.docs
        .map(MenuItem.fromFirestore)
        .where((item) =>
            item.name.toLowerCase().contains(q) ||
            item.description.toLowerCase().contains(q) ||
            item.category.toLowerCase().contains(q))
        .toList();
  }
}
