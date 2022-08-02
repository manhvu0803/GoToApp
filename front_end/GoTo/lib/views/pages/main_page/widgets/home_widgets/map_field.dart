import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_to/configs/app_configs.dart';
import 'package:go_to/configs/constants/dimen_constants.dart';
import 'package:go_to/configs/injection.dart';
import 'package:latlong2/latlong.dart';

class MapField extends StatefulWidget {
  const MapField({Key? key}) : super(key: key);

  @override
  State<MapField> createState() => _MapFieldState();
}

class _MapFieldState extends State<MapField> {
  @override
  Widget build(BuildContext context) {
    final appConfigs = injector<AppConfig>();
    return SizedBox(
      height: DimenConstants.getScreenHeight(context) * 0.6,
      child: FlutterMap(
        options: MapOptions(
          center: LatLng(appConfigs.centerLat, appConfigs.centerLng),
          zoom: 8.0,
        ),
        layers: [
          TileLayerOptions(
            urlTemplate: appConfigs.openStreetMapUrl,
            subdomains: ['a', 'b', 'c'],
          ),
          MarkerLayerOptions(
            markers: [],
          ),
        ],
      ),
    );
  }
}
